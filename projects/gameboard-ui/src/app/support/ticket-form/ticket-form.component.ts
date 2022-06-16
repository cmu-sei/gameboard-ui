import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, switchMap, tap, mergeMap, filter, map, defaultIfEmpty } from 'rxjs/operators';
import { Challenge, ChallengeOverview } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { NewTicket } from '../../api/support-models';
import { SupportService } from '../../api/support.service';
import { UserService } from '../../api/user.service';
import { EditData, SuggestionOption } from '../../utility/components/inplace-editor/inplace-editor.component';
import { UserService as LocalUserService } from '../../utility/user.service';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent implements OnInit {

  summaryLimit = 128;

  requesters: EditData = { isEditing: false, loaded: false, allOptions: [], filteredOptions: [], filtering$: new Subject<string>() };

  ticket: NewTicket = {
    summary: "",
    description: "",
    challengeId: "",
    uploads: []
  } as any;

  // challenge$: Observable<Challenge>;

  challengeRefresh: BehaviorSubject<any> = new BehaviorSubject({});
  challengeOptions: ChallengeOverview[] = [];

  faArrowLeft = faArrowLeft;

  errors: any[] = [];
  canManage$: Observable<boolean>;

  constructor(
    private api: SupportService,
    private boardApi: BoardService,
    private userApi: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private local: LocalUserService
  ) { 


    const paramChallenge$ = route.queryParams.pipe(
      filter(p => !!p.cid),
      switchMap(p => boardApi.retrieve(p.cid)),
      tap(c => {
        this.ticket.challengeId = c.id;
        this.ticket.challenge = c;
      })
    ).subscribe();

    const challenges$ = this.challengeRefresh.pipe(
        switchMap(search => this.api.listUserChallenges(search))
      )
      .subscribe((a) => this.challengeOptions = a);

    this.canManage$ = local.user$.pipe(
      map(u => !!u?.isSupport)
    );

    this.requesters.filtering$.pipe(
      debounceTime(200),
      switchMap((term) => this.userApi.list({term: term})),
    ).subscribe(
      (result) => {
        this.requesters.filteredOptions = result.map(u => ({name:u.approvedName, secondary: u.id.slice(0,8), data:u})).slice(0, 20);
        // this.requesters.filteredOptions.push({name:'Me', })
      }
    );

  }

  ngOnInit(): void {

  }

  submit() {
    // this.api.create(this.ticket).subscribe()
    this.api.upload(this.ticket).subscribe(
      (ticket) => {
        if (!!ticket.id) { // success
          this.router.navigate(['/support/tickets', ticket.id])
        }
      },
      (err) => this.errors.push(err)
    )
  }

  attachments(files: File[]) {
    this.ticket.uploads = files;
    console.log(this.ticket)
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
      this.challengeRefresh.next({uid: this.ticket.requesterId});
    }
  }


}
