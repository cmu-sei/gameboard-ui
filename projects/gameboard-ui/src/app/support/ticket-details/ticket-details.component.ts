import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faCaretLeft, faCaretRight, faCog, faEdit, faEllipsisH, faExclamationCircle, faExternalLinkAlt, faFileAlt, faPaperclip, faPen, faPlusSquare, faSync, faTimes } from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subject, Observable, combineLatest, timer } from 'rxjs';
import { debounceTime, switchMap, tap, filter, map, first, take } from 'rxjs/operators';
import { PlayerService } from '../../api/player.service';
import { AttachmentFile, ChangedTicket, Ticket, TicketActivity } from '../../api/support-models';
import { SupportService } from '../../api/support.service';
import { ApiUser, UserSummary } from '../../api/user-models';
import { UserService } from '../../api/user.service';
import { EditData, SuggestionOption } from '../../utility/components/inplace-editor/inplace-editor.component';
import { UserService as LocalUserService } from '../../utility/user.service';
import { NotificationService } from '../../services/notification.service';
import linkifyHtml from 'linkify-html';
import { ClipboardService } from "../../utility/services/clipboard.service";
import { ToastService } from '../../utility/services/toast.service';
import { FontAwesomeService } from '../../services/font-awesome.service';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss']
})
export class TicketDetailsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('modal') modal!: ModalDirective;

  ctx$: Observable<{ ticket: Ticket; canManage: boolean; }>;

  refresh$ = new BehaviorSubject<any>(true);
  changed$ = new Subject<ChangedTicket>();

  id: string = "";
  key = 0;

  newCommentFocus = false;
  newCommentText = "";
  newCommentAttachments: File[] = [];
  toggleAttachments = true;
  resetAttachments$ = new Subject<boolean>();

  changedTicket?: Ticket;
  currentUser: ApiUser | null = null;

  // objects for managing options and filtering and in place editing feature
  assignees: EditData = { isEditing: false, loaded: false, allOptions: [], filteredOptions: [], filtering$: new Subject<string>() };
  labels: EditData = { isEditing: false, loaded: false, allOptions: [], filteredOptions: [], filtering$: new Subject<string>() };
  challenges: EditData = { isEditing: false, loaded: false, allOptions: [], filteredOptions: [], filtering$: new Subject<string>() };
  sessions: EditData = { isEditing: false, loaded: false, allOptions: [], filteredOptions: [], filtering$: new Subject<string>() };
  requesters: EditData = { isEditing: false, loaded: false, allOptions: [], filteredOptions: [], filtering$: new Subject<string>() };

  editingContent = false;
  savingContent = false;
  editingCommentId = null;

  currentLabels = new Set<string>();

  faArrowLeft = faArrowLeft;
  faFileAlt = faFileAlt;
  faEllipsisH = faEllipsisH;
  faPaperclip = faPaperclip;
  faExternalLinkAlt = faExternalLinkAlt;
  faCog = faCog;
  faEdit = faEdit;
  faPen = faPen;
  faTimes = faTimes;
  faPlusSquare = faPlusSquare;
  faCaretRight = faCaretRight;
  faCaretLeft = faCaretLeft;
  faExclamationCircle = faExclamationCircle;
  faSync = faSync;

  selectedAttachmentList?: AttachmentFile[];
  // Storage for attachments uploaded in the original ticket request
  attachmentObjectUrls: SafeResourceUrl[] = [];
  // Storage for attachments uploaded via comments in the ticket
  commentAttachmentMap: Map<string, SafeResourceUrl[]> = new Map<string, SafeResourceUrl[]>();
  // Storage for selected images' URLs
  selectedObjectUrls: SafeResourceUrl[] = this.attachmentObjectUrls;
  selectedIndex: number = 0;

  constructor(
    private api: SupportService,
    private clipboard: ClipboardService,
    private faService: FontAwesomeService,
    private logService: LogService,
    private playerApi: PlayerService,
    private userApi: UserService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private toastsService: ToastService,
    hub: NotificationService,
    local: LocalUserService,
    route: ActivatedRoute,
  ) {

    const canManage$ = local.user$.pipe(
      tap(u => this.currentUser = u),
      map(u => !!u?.isSupport)
    );

    const ticket$ = combineLatest([
      route.params,
      this.refresh$,
      // timer(0, 30_000) // refresh-causing line - runs every 30 seconds
    ]).pipe(
      map(([p, r]) => p),
      filter(p => !!p.id && (!this.editingContent || this.savingContent)), // don't refresh data if editing and not saving yet
      tap(p => this.key = p.id),
      switchMap(p => api.retrieve(p.id)),
      tap(t => {
        this.editingContent = false;
        this.savingContent = false;
        this.changedTicket = { ...t };
        this.id = t.id;
      }),
      tap(t => {
        this.currentLabels.clear();
        t.label?.split(" ")?.forEach(label => {
          if (!!label && label.length > 0)
            this.currentLabels.add(label);
        });
      }),
      tap(a => {
        // Initialize ticket attachment URL object
        this.attachmentObjectUrls = new Array<SafeResourceUrl>(a.attachmentFiles.length);
        // Set the selected object urls
        this.selectedObjectUrls = this.attachmentObjectUrls;
        // Fetch each original ticket's attachment file
        a.attachmentFiles.forEach((f, i) => this.fetchFile(f, i));
        // Initialize comment attachment URL object - store it in a map to account for multiple comments
        a.activity.forEach((g, i) => this.commentAttachmentMap.set(g.id, new Array<SafeResourceUrl>(g.attachmentFiles.length)));
        // Fetch each comment's attachments
        a.activity.forEach((g, i) => g.attachmentFiles.forEach((f, j) => this.fetchFile(f, j, g)));
        a.selfCreated = a.creatorId == a.requesterId;
        a.created = new Date(a.created);
        let recent = new Date(new Date().getTime() - (5) * 60_000);
        a.canUpdate = a.created > recent;
      })
    );

    this.ctx$ = combineLatest([ticket$, canManage$]).pipe(
      map(([ticket, canManage]) => ({ ticket: ticket, canManage: canManage }))
    );

    this.initFiltering();

    this.changed$.pipe(
      debounceTime(500),
      switchMap(c => api.update(c))
    ).subscribe(
      a => {
        this.refresh$.next(true);
      }
    );

    hub.ticketEvents.pipe(
      filter(e => e.model.key !== this.key)
    ).subscribe(e => this.refresh$.next(true));

  }

  // Grabs a given file, then sets the source of an image to be the URL within manifested as a blob.
  fetchFile(file: AttachmentFile, imgId: number, activity: TicketActivity | null = null) {
    // Run a get request to the file location; retrieve as a blob to avoid storing an absolute link
    this.http.get(file.fullPath,
      { observe: 'response', responseType: 'blob' }
    ).pipe(first()).subscribe(
      // a represents the response, in this case a blob
      (a) => {
        // Get the image element on the screen, abort if it or the blob is null
        let img = activity ? document.getElementById(`comment-attachment-${activity.id}-${imgId}`) : document.getElementById(`attachment-${imgId}`);
        if (img == null || a.body == null) return;
        // Create a new object URL from the blob, then set the src to reference that
        let url: string = URL.createObjectURL(a.body);
        img.setAttribute("src", url);
        // Set the appropriate storage object based on whether this is being called on a comment or not
        if (activity) this.commentAttachmentMap.get(activity.id)![imgId] = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        else this.attachmentObjectUrls[imgId] = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }, async (error) => {
        // In case of an error, print it
        this.logService.logError("Error encountered while retrieving image:", error);
      }
    );
  }

  ngAfterViewInit(): void {
    this.modal?.onHide?.subscribe(
      () => {
        this.selectedAttachmentList = undefined;
        this.selectedIndex = 0;
      }
    );
  }

  ngOnDestroy(): void {
    this.api.seen(this.key);
  }

  addComment() {
    if (!!this.newCommentText || !!this.newCommentAttachments) {
      let newComment = {
        ticketId: this.id,
        message: this.newCommentText,
        uploads: this.newCommentAttachments
      };
      this.api.comment(newComment).subscribe(
        (result) => {
          this.newCommentFocus = false;
          this.newCommentText = "";
          this.newCommentAttachments = [];
          this.refresh$.next(true);
          this.resetAttachments$.next(true);
        },
        (err) => {
          alert(err);
        }
      );
    }
  }

  updateAttachments(files: File[]) {
    this.newCommentAttachments = files;
  }

  // Expand an image in a new viewer window.
  enlarge(attachmentList: AttachmentFile[], index: number, objectUrls: SafeResourceUrl[] | undefined) {
    // Abort if the list of URLs we reference isn't initialized yet
    if (objectUrls == undefined) return;
    // Otherwise, set the currently selected object URLs to be the given ones
    this.selectedObjectUrls = objectUrls;
    this.selectedAttachmentList = attachmentList;
    this.selectedIndex = index;
    this.modal.show();
  }

  nextAttachment() {
    this.selectedIndex += 1;
  }

  prevAttachment() {
    this.selectedIndex -= 1;
  }

  startEditTicketContent() {
    this.editingContent = true;
  }

  saveEditedTicket() {
    if (this.changedTicket) {
      this.savingContent = true;
      this.changed$.next(this.changedTicket);
    }
  }

  startEditAssignee() {
    this.resetEditing();
    this.assignees.isEditing = true;

    if (!this.assignees.loaded) {
      this.api.listSupport({}).subscribe(
        (a) => {
          this.assignees.allOptions = a.map(u => ({ name: u.approvedName, secondary: u.id.slice(0, 8), data: u }));
          this.assignees.allOptions.push({ name: "None", secondary: "", data: {} });
          this.assignees.filteredOptions = this.assignees.allOptions;
          this.assignees.loaded = true;
        }
      );
    }
  }

  startEditLabels() {
    this.resetEditing();
    this.labels.isEditing = true;

    if (!this.labels.loaded) {
      this.api.listLabels({}).subscribe(
        (a) => {
          this.labels.allOptions = a.map(l => ({ name: l, secondary: "", data: l }));
          this.labels.filtering$.next("");
          this.labels.loaded = true;
        }
      );
    } else {
      this.labels.filtering$.next("");
    }
  }

  startEditChallenge() {
    this.resetEditing();
    this.challenges.isEditing = true;

    if (!this.challenges.loaded) {
      this.api.listUserChallenges({ uid: this.changedTicket?.requesterId! }).subscribe(
        (a) => {
          this.challenges.allOptions = a.map(c => ({ name: c.name, secondary: c.id.slice(0, 8) + (!!c.tag ? ' ' + c.tag : ''), data: c }));
          this.challenges.allOptions.push({ name: "None", secondary: "", data: {} });
          this.challenges.filtering$.next("");
          this.challenges.loaded = true;
        }
      );
    } else {
      this.challenges.filtering$.next("");
    }
  }

  startEditSession() {
    this.resetEditing();
    this.sessions.isEditing = true;
    if (!this.sessions.loaded) {
      this.playerApi.list({ uid: this.changedTicket?.requesterId!, sort: 'time' }).subscribe(
        (a) => {
          this.sessions.allOptions = a.map(c => ({ name: c.gameName, secondary: c.approvedName, data: c }));
          this.sessions.allOptions.push({ name: "None", secondary: "", data: {} });
          this.sessions.filteredOptions = this.sessions.allOptions;
          this.sessions.loaded = true;
        }
      );
    }
  }

  startEditRequesters() {
    this.resetEditing();
    this.requesters.isEditing = true;

    if (!this.requesters.loaded) {
      this.userApi.list({}).subscribe(
        (a) => {
          this.requesters.allOptions = a.map(u => ({ name: u.approvedName, secondary: u.id.slice(0, 8), data: u }));
          this.requesters.filteredOptions = this.requesters.allOptions;
          this.requesters.loaded = true;
        }
      );
    }
  }

  resetEditing() {
    this.labels.isEditing = false;
    this.assignees.isEditing = false;
    this.challenges.isEditing = false;
    this.sessions.isEditing = false;
  }

  selectAssignee(option: SuggestionOption) {
    this.changedTicket!.assignee = option.data;
    this.changedTicket!.assigneeId = option.data.id;
    this.changed$.next(this.changedTicket!);
    this.assignees.isEditing = false;
    this.assignees.filteredOptions = this.assignees.allOptions;
  }

  selectAssignToMe() {
    if (!!this.currentUser) {
      this.changedTicket!.assignee = { id: this.currentUser.id, approvedName: this.currentUser.approvedName } as UserSummary;
      this.changedTicket!.assigneeId = this.currentUser.id;
      this.changed$.next(this.changedTicket!);
    }
  }

  selectLabel(option: SuggestionOption) {
    if (!this.currentLabels.has(option.name)) {
      this.currentLabels.add(option.name);
      this.changedTicket!.label = Array.from(this.currentLabels.values()).join(" ");
      this.changed$.next(this.changedTicket!);
    }
    this.labels.isEditing = false;
    this.labels.filtering$.next("");

  }

  selectChallenge(option: SuggestionOption) {
    this.changedTicket!.challenge = option.data;
    this.changedTicket!.challengeId = option.data.id;
    this.changed$.next(this.changedTicket!);
    this.challenges.isEditing = false;
    this.challenges.filteredOptions = this.challenges.allOptions;
  }

  selectSession(option: SuggestionOption) {
    this.changedTicket!.player = option.data;
    this.changedTicket!.playerId = option.data.id;
    this.changed$.next(this.changedTicket!);
    this.sessions.isEditing = false;
    this.sessions.filteredOptions = this.sessions.allOptions;
  }

  selectRequester(option: SuggestionOption) {
    this.changedTicket!.requester = option.data;
    this.changedTicket!.requesterId = option.data.id;
    this.changed$.next(this.changedTicket!);
    this.requesters.isEditing = false;
    this.requesters.filteredOptions = this.requesters.allOptions;
  }

  deleteLabel(label: string): void {
    this.currentLabels.delete(label);
    this.changedTicket!.label = Array.from(this.currentLabels.values()).join(" ");
    this.changed$.next(this.changedTicket!);
  }

  initFiltering() {
    this.labels.filtering$.pipe(
      debounceTime(200),
      map(a => a.trim()),
      map(a => a.replace(/\s+/g, '-'))
    ).subscribe(
      a => {
        this.labels.filteredOptions = this.labels.allOptions?.filter(l => {
          return (!a || l.name.toLowerCase().includes(a.toLowerCase()))
            && !this.currentLabels.has(l.name);
        });

        if (!!a && this.labels.filteredOptions?.length == 0 && !this.currentLabels.has(a)) {
          this.labels.filteredOptions!.push({ name: a, secondary: "(New Label)", data: a });
        }
      }
    );

    this.assignees.filtering$.pipe(
      debounceTime(200),
      map(a => a.toLowerCase())
    ).subscribe(
      a => {
        this.assignees.filteredOptions = this.assignees.allOptions?.filter(l => l.name.toLowerCase().includes(a) || l.data.id?.toLowerCase()?.startsWith(a));
      }
    );

    this.challenges.filtering$.pipe(
      debounceTime(200),
      map(a => a.toLowerCase())
    ).subscribe(
      a => {
        this.challenges.filteredOptions = this.challenges.allOptions?.filter(l => {
          return l.name.toLowerCase().includes(a) || l.data.id?.toLowerCase()?.startsWith(a) ||
            l.data.tag?.toLowerCase().includes(a);
        });
        if (!!this.changedTicket?.player) {
          this.challenges.filteredOptions = this.challenges.filteredOptions.filter(l => !l.data.gameId || l.data.gameId == this.changedTicket?.player?.gameId);
        }
      }
    );

    this.sessions.filtering$.pipe(
      debounceTime(200),
      map(a => a.toLowerCase())
    ).subscribe(
      a => {
        this.sessions.filteredOptions = this.sessions.allOptions?.filter(l => {
          return l.name.toLowerCase().includes(a) || l.data.id?.toLowerCase()?.startsWith(a) ||
            l.data.approvedName?.toLowerCase().includes(a);
        });
      }
    );

    this.requesters.filtering$.pipe(
      debounceTime(200),
      map(a => a.toLowerCase())
    ).subscribe(
      a => {
        this.requesters.filteredOptions = this.requesters.allOptions?.filter(l => {
          return l.name.toLowerCase().includes(a) || l.data.id?.toLowerCase()?.startsWith(a);
        });
      }
    );
  }

  public async copyToMarkdown(ticket: Ticket) {
    this.api.getTicketMarkdown(ticket).pipe(first()).subscribe(async md => {
      await this.clipboard.copy(md);
      this.toastsService.show({
        faIcon: this.faService.clipboard,
        text: "Ticket markdown copied"
      });
    });
  }

  public detectLinks(body: string, id: string): void {
    var elem = document.getElementById(id);
    if (elem && body) elem.innerHTML = linkifyHtml(body, { nl2br: true });
  }
}
