import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom, from, map } from 'rxjs';
import { ReportKey, ReportViewModel } from '@/reports/reports-models';
import { ReportsService } from '@/reports/reports.service';
import { ActiveReportService } from '@/reports/services/active-report.service';
import { RouterService } from '@/services/router.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
    selector: 'app-report-page',
    templateUrl: './report-page.component.html',
    styleUrls: ['./report-page.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
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

    if (this.reports.length) {
      // if someone linked in a specific report, try to identify it here
      const requestedReport = this.route.snapshot.firstChild?.data?.reportKey as ReportKey;

      if (requestedReport) {
        this.selectedReport = requestedReport;
        this.displayReport(this.selectedReport, this.route.snapshot.queryParams);
      } else {
        this.selectedReport = this.reports[0].key as ReportKey;
        this.displayReport(this.reports[0].key as ReportKey, this.route.snapshot.queryParams);

        // automatically run the report if there are any
        // parameters in the QS (to support linking in from outside the app)
        if (this.route.snapshot.queryParams && Object.keys(this.route.snapshot.queryParams).length) {
          this.activeReportService.generateRequested$.next();
        }
      }
    }
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
