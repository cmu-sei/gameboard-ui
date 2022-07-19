import { Component, OnInit } from '@angular/core';
import { faCaretLeft, faCaretRight, faComments, faPaperclip, faSearch } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Subject, Observable, timer, combineLatest } from 'rxjs';
import { debounceTime, switchMap, tap, mergeMap, map, filter } from 'rxjs/operators';
import { TicketSummary } from '../../api/support-models';
import { SupportService } from '../../api/support.service';
import { UserService as LocalUserService } from '../../utility/user.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  refresh$ = new BehaviorSubject<any>(true);
  ctx$: Observable<{ tickets: TicketSummary[]; nextTicket: TicketSummary[]; canManage: boolean; }>;
  advanceRefresh$ = new BehaviorSubject<any>(true);

  searchText: string = "";
  statusFilter: string = "Any Status";
  assignFilter: string = "Any";

  take = 25;
  skip = 0;

  faComments = faComments;
  faPaperclip = faPaperclip;
  faSearch = faSearch;
  faCaretRight = faCaretRight;
  faCaretLeft =faCaretLeft;

  constructor(
    private api: SupportService,
    private local: LocalUserService
  ) { 

    const canManage$ = local.user$.pipe(
      map(u => !!u?.isObserver || !!u?.isSupport)
    );

    const ticket$ = combineLatest([
      this.refresh$,
      timer(0, 60_000)
    ]).pipe(
      debounceTime(250),
      switchMap(() => api.list({
        term: this.searchText,
        filter: [this.statusFilter.toLowerCase(), this.assignFilter.toLowerCase()],
        take: this.take,
        skip: this.skip
      })),
      map(a => {
        a.forEach(t => t.labelsList = t.label?.split(" ").filter(l => !!l));
        return a;
      })
    );

    const nextTicket$ = combineLatest([
      this.advanceRefresh$,
      timer(0, 60_000)
    ]).pipe(
      debounceTime(250),
      switchMap(() => api.list({
        term: this.searchText,
        filter: [this.statusFilter.toLowerCase(), this.assignFilter.toLowerCase()],
        take: 1,
        skip: this.skip + this.take
      })),
      map(a => {
        a.forEach(t => t.labelsList = t.label?.split(" ").filter(l => !!l));
        return a;
      })
    );

    this.ctx$ = combineLatest([ ticket$, nextTicket$, canManage$]).pipe(
      map(([tickets, nextTicket, canManage]) => ({tickets: tickets, nextTicket: nextTicket, canManage: canManage}))
    );
  }

  ngOnInit(): void {
  }

  next() {
    this.skip = this.skip + this.take;
    this.refresh$.next(true);
    this.advanceRefresh$.next(true);
  }

  prev() {
    this.skip = this.skip - this.take;
    if (this.skip < 0)
      this.skip = 0;

    this.refresh$.next(true);
    this.advanceRefresh$.next(true);
  }

  getLatterDateString(date: string): string {
    return date.split(", ")[2];
  }

}
