import { Component, OnDestroy } from '@angular/core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable, Subject, Subscription, firstValueFrom } from 'rxjs';
import { debounceTime, switchMap, tap, filter, map } from 'rxjs/operators';
import { ChallengeOverview } from '../../api/board-models';
import { NewTicket } from '../../api/support-models';
import { SupportService } from '../../api/support.service';
import { UserService } from '../../api/user.service';
import { EditData, SuggestionOption } from '../../utility/components/inplace-editor/inplace-editor.component';
import { UserService as LocalUserService } from '../../utility/user.service';
import { RouterService } from '@/services/router.service';
import { ActivatedRoute } from '@angular/router';
import { LogService } from '@/services/log.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { ChallengesService } from '@/api/challenges.service';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent implements OnDestroy {
  summaryLimit = 128;
  requesters: EditData = { isEditing: false, loaded: false, allOptions: [], filteredOptions: [], filtering$: new Subject<string>() };

  ticket: NewTicket = {
    summary: "",
    description: "",
    challengeId: "",
    uploads: []
  } as any;

  challengeRefresh: BehaviorSubject<any> = new BehaviorSubject({});
  challengeOptions: ChallengeOverview[] = [];
  isSubmitting = false;

  faArrowLeft = faArrowLeft;

  errors: any[] = [];
  canManage$: Observable<boolean>;

  private challengeRefreshSub?: Subscription;
  private requestersFilteringSub?: Subscription;
  private routeSub?: Subscription;

  constructor(
    private api: SupportService,
    private log: LogService,
    private permissionsService: UserRolePermissionsService,
    private routerService: RouterService,
    private userApi: UserService,
    challengeService: ChallengesService,
    route: ActivatedRoute,
    localUserService: LocalUserService
  ) {
    this.canManage$ = this.permissionsService.can$("Support_ManageTickets");

    this.routeSub = route.queryParams.pipe(
      filter(p => !!p.cid),
      switchMap(p => challengeService.retrieve(p.cid)),
      tap(c => {
        this.ticket.challengeId = c.id;
        this.ticket.challenge = c;
      })
    ).subscribe();

    this.challengeRefreshSub = this.challengeRefresh.pipe(
      switchMap(search => this.api.listUserChallenges(search))
    ).subscribe((a) => this.challengeOptions = a);

    this.requestersFilteringSub = this.requesters.filtering$.pipe(
      debounceTime(200),
      switchMap((term) => this.userApi.list({ term: term, take: 25 })),
    ).subscribe(
      (result) => {
        this.requesters.filteredOptions = result.map(u => ({ name: u.approvedName, secondary: u.id.slice(0, 8), data: u })).slice(0, 20);
      }
    );
  }

  async submit() {
    this.isSubmitting = true;
    try {
      const ticket = await firstValueFrom(this.api.upload(this.ticket));
      if (!!ticket.id) {
        this.routerService.toSupportTickets(ticket.key.toString());
      }
    }
    catch (err: any) {
      this.log.logError("Error on ticket submit", err);
    }
    this.isSubmitting = false;
  }

  attachments(files: File[]) {
    this.ticket.uploads = files;
  }

  startEditRequesters() {
    this.requesters.isEditing = true;
    this.requesters.filtering$.next("");
  }

  selectRequester(option: SuggestionOption) {
    let prevId = this.ticket.requesterId;
    this.ticket!.requester = option.data;
    this.ticket!.requesterId = option.data.id;
    this.requesters.isEditing = false;
    if (prevId != this.ticket.requesterId) {
      this.ticket.challengeId = "";
      this.challengeRefresh.next({ uid: this.ticket.requesterId });
    }
  }

  ngOnDestroy(): void {
    this.challengeRefreshSub?.unsubscribe();
    this.requestersFilteringSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }
}
