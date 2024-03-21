import { Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, timer, combineLatest, Subscription } from 'rxjs';
import { debounceTime, switchMap, map, tap, first } from 'rxjs/operators';
import { ReportService } from '../../api/report.service';
import { TicketNotification, TicketSummary } from '../../api/support-models';
import { SupportService } from '../../api/support.service';
import { ConfigService } from '../../utility/config.service';
import { NotificationService } from '../../services/notification.service';
import { UserService as LocalUserService } from '../../utility/user.service';
import { ToastService } from '../../utility/services/toast.service';
import { ClipboardService } from '../../utility/services/clipboard.service';
import { fa } from '@/services/font-awesome.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnDestroy {
  subs: Subscription[] = [];
  refresh$ = new BehaviorSubject<any>(true);
  ctx$: Observable<{ tickets: TicketSummary[]; nextTicket: TicketSummary[]; canManage: boolean; }>;
  advanceRefresh$ = new BehaviorSubject<any>(true);
  list: TicketSummary[] = [];
  searchText: string = "";
  statusFilter: string = "Any Status";
  assignFilter: string = "Any Assignment";

  curOrderItem: string = "created";
  isDescending: boolean = true;
  hoverOrderItem: string = "";
  showHoverCaret: boolean = false;

  take = 25;
  skip = 0;

  protected fa = fa;
  protected isLoading = false;
  protected selectedLabels: string[] = [];

  constructor(
    local: LocalUserService,
    private api: SupportService,
    private clipboard: ClipboardService,
    private config: ConfigService,
    private reportApi: ReportService,
    private toastService: ToastService,
    hub: NotificationService,
    route: ActivatedRoute
  ) {

    this.searchText = config.local.ticketTerm || "";
    this.statusFilter = config.local.ticketFilter || "Any Status";
    this.assignFilter = config.local.ticketType || "Any Assignment";
    this.curOrderItem = config.local.ticketOrder || "created";
    this.isDescending = config.local.ticketOrderDesc || true;

    const canManage$ = local.user$.pipe(
      map(u => !!u?.isObserver || !!u?.isSupport)
    );

    const ticket$ = combineLatest([
      this.refresh$,
      timer(0, 60_000)
    ]).pipe(
      debounceTime(250),
      tap(() => {
        config.updateLocal({
          ticketTerm: this.searchText,
          ticketFilter: this.statusFilter,
          ticketType: this.assignFilter
        });

        this.isLoading = true;
      }),
      switchMap(() => api.list({
        term: this.searchText,
        filter: [this.statusFilter.toLowerCase(), this.assignFilter.toLowerCase(), this.selectedLabels],
        withAllLabels: this.selectedLabels.join(","),
        take: this.take,
        skip: this.skip,
        orderItem: this.curOrderItem,
        isDescending: this.isDescending
      })),
      map(a => {
        a.forEach(t => t.labelsList = t.label?.split(" ").filter(l => !!l));
        return a;
      }),
      tap(a => {
        this.list = a;
        this.isLoading = false;
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
        withAllLabels: (this.selectedLabels || []).join(","),
        take: 1,
        skip: this.skip + this.take,
        orderItem: this.curOrderItem,
        isDescending: this.isDescending
      })),
      map(a => {
        a.forEach(t => t.labelsList = t.label?.split(" ").filter(l => !!l));
        return a;
      })
    );

    this.ctx$ = combineLatest([ticket$, nextTicket$, canManage$]).pipe(
      map(([tickets, nextTicket, canManage]) => ({ tickets: tickets, nextTicket: nextTicket, canManage: canManage }))
    );

    this.subs.push(route.queryParams.subscribe(qp => {
      if (qp.search) {
        this.searchText = qp.search;
      }
    }));

    this.subs.push(
      hub.ticketEvents.subscribe(
        e => {
          const n = e.model as TicketNotification;
          const f = this.list.find(t => t.key === n.key);
          if (!!f) {
            f.lastUpdated = new Date(n.lastUpdated);
            f.status = n.status;
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.config.updateLocal({ lastSeenSupport: Date.now() });
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

  // Orders by a given column name by querying the API.
  orderByColumn(orderItem: string) {
    // If the provided item is the currently ordered one, just switch the ordering
    if (orderItem == this.curOrderItem) {
      this.isDescending = !this.isDescending;
    }
    // Otherwise, always start ordering it in descending order
    else {
      this.curOrderItem = orderItem;
      this.isDescending = true;
    }

    this.config.updateLocal({ ticketOrder: this.curOrderItem, ticketOrderDesc: this.isDescending });

    this.refresh$.next(true);
    this.advanceRefresh$.next(true);
  }

  downloadTicketDetailReport() {
    this.reportApi.exportTicketDetails({ term: this.searchText, filter: [this.statusFilter.toLowerCase(), this.assignFilter.toLowerCase()] });
  }

  protected handleLabelSelectionChanged(labels: string[]) {
    this.selectedLabels = labels;
    this.refresh$.next(true);
  }

  async copyMarkdown(ticket: TicketSummary) {
    this.api.retrieve(ticket.key).pipe(
      first(),
      switchMap(ticket => this.api.getTicketMarkdown(ticket)),
    ).subscribe(async md => {
      await this.clipboard.copy(md);
      this.toastService.show({ text: "Copied ticket markdown", faIcon: fa.clipboard });
    });
  }
}
