import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom, from, map } from 'rxjs';
import { ReportKey, ReportMetaData, ReportViewModel } from '@/reports/reports-models';
import { ReportsService } from '@/reports/reports.service';
import { ActiveReportService } from '@/reports/services/active-report.service';
import { RouterService } from '@/services/router.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss'],
  providers: [UnsubscriberService]
})
export class ReportPageComponent implements OnInit {
  private unsub = inject(UnsubscriberService);

  protected metaData$ = this
    .activeReportService
    .metaData$;

  protected reports: ReportViewModel[] = [];
  protected report$?: Observable<ReportViewModel | null>;
  protected selectedReport?: ReportKey;

  constructor(
    private activeReportService: ActiveReportService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private routerService: RouterService) {
  }

  async ngOnInit(): Promise<void> {
    this.reports = await this.reportsService.list();
    this.unsub.add(this.activeReportService.metaData$.subscribe(m => {
      console.log("report metadata", m);
    }));
  }

  protected handleReportSelect(reportKey?: ReportKey) {
    if (reportKey) {
      this.displayReport(reportKey);
    }
  }

  async handleExportToCsv() {
    if (!this.activeReportService.metaData$.value?.key) {
      throw new Error("Can't export a report with unspecified key");
    }

    const queryParams = await firstValueFrom(this.route.queryParams);
    this.reportsService.openExport(
      this.activeReportService.metaData$.value?.key,
      { ...queryParams }
    );
  }

  private async displayReport(reportKey: ReportKey, query: Object | null = null) {
    const metadata = await firstValueFrom(this.reportsService.getReportMetaData(reportKey));
    this.activeReportService.metaData$.next(metadata);
    this.routerService.toReport(reportKey, query);
  }
}
