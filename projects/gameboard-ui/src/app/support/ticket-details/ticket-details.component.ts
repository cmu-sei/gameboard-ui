import { AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faCaretLeft, faCaretRight, faCog, faEdit, faEllipsisH, faExclamationCircle, faExternalLinkAlt, faFileAlt, faPaperclip, faPeace, faPen, faPlusSquare, faSync, faTimes } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { User } from 'oidc-client';
import { BehaviorSubject, Subject, Observable, combineLatest, interval, timer } from 'rxjs';
import { debounceTime, switchMap, tap, mergeMap, filter, map } from 'rxjs/operators';
import { PlayerService } from '../../api/player.service';
import { ActivityType, AttachmentFile, ChangedTicket, LabelSuggestion, Ticket, TicketSummary } from '../../api/support-models';
import { SupportService } from '../../api/support.service';
import { ApiUser, UserSummary } from '../../api/user-models';
import { UserService } from '../../api/user.service';
import { EditData, SuggestionOption } from '../../utility/components/inplace-editor/inplace-editor.component';
import { ConfigService } from '../../utility/config.service';
import { UserService as LocalUserService } from '../../utility/user.service';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss']
})
export class TicketDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('modal') modal!: ModalDirective;
  // @ViewChildren('input1') input1!: QueryList<ElementRef>;
  // @ViewChild('assignInput') assignInput!: ElementRef;
  // @ViewChild('labelInput') labelInput!: ElementRef;
  
  ctx$: Observable<{ ticket: Ticket; canManage: boolean; }>;

  refresh$ = new BehaviorSubject<any>(true);
  // ticket$: Observable<Ticket>;
  changed$ = new Subject<ChangedTicket>();
  // canManage$ = new Observable<boolean>();
  // attachments: AttachmentFile[] = [];
  // attachments$: Observable<AttachmentFile[]>;

  id: string = "";

  newCommentFocus = false;
  newCommentText = "";
  newCommentAttachments: File[] = [];
  toggleAttachments = true;
  resetAttachments$ = new Subject<boolean>();

  changedTicket?: Ticket;
  currentUser: ApiUser | null = null;

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

  modalRef?: BsModalRef;
  // modalRef?: BsModalRef;
  selectedAttachmentList?: AttachmentFile[];
  selectedIndex: number = 0;

  constructor(
    private api: SupportService,
    private playerApi: PlayerService,
    private userApi: UserService,
    private route: ActivatedRoute,
    private config: ConfigService,
    // private modalService: BsModalService
    private sanitizer: DomSanitizer,
    private local: LocalUserService
  ) { 

    const canManage$ = local.user$.pipe(
      tap(u => this.currentUser = u),
      map(u => !!u?.isSupport)
    );

    const ticket$ = combineLatest([
        route.params,
        this.refresh$,
        timer(0, 30_000)
      ]).pipe(
      map(([p, r]) => p),
      tap(a => console.log(a, this.savingContent)),
      filter(p => !!p.id && (!this.editingContent || this.savingContent)),
      // filter(p => !this.editingContent),
      tap(p => this.id = p.id),
      switchMap(p => api.retrieve(p.id)),
      tap(t => {
        this.editingContent = false;
        this.savingContent = false;
        this.changedTicket = {...t};
      }),
      // tap(t => {this.editingContent = false}),
      tap(t => {
        this.currentLabels.clear();
        t.label?.split(" ")?.forEach(label => {
          if (!!label && label.length > 0)
            this.currentLabels.add(label);
        });
      }),
      tap(a => {
        a.attachmentFiles = a.attachments.map(f => this.mapFile(f, this.id));
        a.activity.forEach(g => g.attachmentFiles = g.attachments.map(f => this.mapFile(f, `${this.id}/${g.id}`)));
        a.selfCreated = a.creatorId == a.requesterId;
        a.created = new Date(a.created);
        let recent = new Date(new Date().getTime() - (5)*60_000);
        a.canUpdate = a.created > recent;
        console.log(a.created, recent, a.canUpdate)
      })
      // tap(a => console.log(a, this.changedTicket))
    );

    this.ctx$ = combineLatest([ ticket$, canManage$]).pipe(
      map(([ticket, canManage]) => ({ticket: ticket, canManage: canManage}))
    );

    this.initFiltering();

    this.changed$.pipe(
      debounceTime(500),
      switchMap(c => api.update(c))
    ).subscribe(
      a => {
        console.log(a);
        this.refresh$.next(true);
      }
    );
    

  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.modal?.onHide?.subscribe(
      () => {
        this.selectedAttachmentList = undefined;
        this.selectedIndex = 0;
      }
    )
  }

  addComment() {
    if (!!this.newCommentText) {
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
          alert(err)
        }
      );
    }
  }

  updateAttachments(files: File[]) {
    this.newCommentAttachments = files;
    console.log(this.newCommentAttachments);
  }

  mapFile(filename: string, path: string): AttachmentFile {
    let ext = filename.split('.').pop() || "";
    return {
      filename: filename,
      extension: ext,
      fullPath: this.sanitizer.bypassSecurityTrustResourceUrl(`${this.config.supporthost}/tickets/${path}/${filename}`),
      showPreview: !!ext.match(/(png|jpeg|jpg|gif|webp|svg)/)
    };
  }

  enlarge(attachmentList: AttachmentFile[], index: number) {
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
    this.savingContent = true;
    this.changed$.next(this.changedTicket);
  }

  startEditCommentContent() {

  }

  startEditAssignee() {
    this.resetEditing();
    this.assignees.isEditing = true;
    
    if (!this.assignees.loaded) {
      this.api.listSupport({}).subscribe(
        (a) => {
          this.assignees.allOptions = a.map(u => ({name:u.approvedName, secondary: u.id.slice(0,8), data:u}));
          this.assignees.allOptions.push({name: "None", secondary:"", data:{}});
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
          this.labels.allOptions = a.map(l => ({name:l, secondary: "", data:l}));
          // this.filteredLabels = this.allLabels;
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
      this.api.listUserChallenges({uid: this.changedTicket?.requesterId!}).subscribe(
        (a) => {
          this.challenges.allOptions = a.map(c => ({name:c.name, secondary: c.id.slice(0,8)+(!!c.tag ? ' '+c.tag : ''), data:c}));
          this.challenges.allOptions.push({name: "None", secondary:"", data:{}});
          // this.challenges.filteredOptions = this.challenges.allOptions;
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
      this.playerApi.list({uid:this.changedTicket?.requesterId!, sort:'time'}).subscribe(
        (a) => {
          this.sessions.allOptions = a.map(c => ({name:c.gameName, secondary: c.approvedName, data:c}));
          this.sessions.allOptions.push({name: "None", secondary:"", data:{}});
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
          this.requesters.allOptions = a.map(u => ({name:u.approvedName, secondary: u.id.slice(0,8), data:u}));
          // this.requesters.allOptions.push({name: "No one", secondary:"", data:{}});
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
    this.changed$.next(this.changedTicket);
    this.assignees.isEditing = false;
    this.assignees.filteredOptions = this.assignees.allOptions;
  }

  selectAssignToMe() {
    if (!!this.currentUser) {
      this.changedTicket!.assignee = {id: this.currentUser.id, approvedName: this.currentUser.approvedName} as UserSummary;
      this.changedTicket!.assigneeId = this.currentUser.id;
      this.changed$.next(this.changedTicket)
    }
  }

  selectLabel(option: SuggestionOption) {
    if (!this.currentLabels.has(option.name)) {
      this.currentLabels.add(option.name)
      this.changedTicket!.label = Array.from(this.currentLabels.values()).join(" ")
      this.changed$.next(this.changedTicket);
    }
    this.labels.isEditing = false;
    this.labels.filtering$.next("")

  }

  selectChallenge(option: SuggestionOption) {
    this.changedTicket!.challenge = option.data;
    this.changedTicket!.challengeId = option.data.id;
    this.changed$.next(this.changedTicket);
    this.challenges.isEditing = false;
    this.challenges.filteredOptions = this.challenges.allOptions;
  }

  selectSession(option: SuggestionOption) {
    this.changedTicket!.player = option.data;
    this.changedTicket!.playerId = option.data.id;
    this.changed$.next(this.changedTicket);
    this.sessions.isEditing = false;
    this.sessions.filteredOptions = this.sessions.allOptions;
  }

  selectRequester(option: SuggestionOption) {
    this.changedTicket!.requester = option.data;
    this.changedTicket!.requesterId = option.data.id;
    this.changed$.next(this.changedTicket);
    this.requesters.isEditing = false;
    this.requesters.filteredOptions = this.requesters.allOptions;
  }

  deleteLabel(label: string): void {
    this.currentLabels.delete(label);
    this.changedTicket!.label = Array.from(this.currentLabels.values()).join(" ")
    this.changed$.next(this.changedTicket);
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
          this.labels.filteredOptions!.push({name: a, secondary: "(New Label)", data:a});
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
        console.log(this.changedTicket, this.challenges)
        this.challenges.filteredOptions = this.challenges.allOptions?.filter(l => {
          return l.name.toLowerCase().includes(a) || l.data.id?.toLowerCase()?.startsWith(a) ||
            l.data.tag?.toLowerCase().includes(a)
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
            l.data.approvedName?.toLowerCase().includes(a)
        });
      }
    );

    this.requesters.filtering$.pipe(
      debounceTime(200),
      map(a => a.toLowerCase())
    ).subscribe(
      a => {
        this.requesters.filteredOptions = this.requesters.allOptions?.filter(l => {
          return l.name.toLowerCase().includes(a) || l.data.id?.toLowerCase()?.startsWith(a)
        });
      }
    );
  }

}
