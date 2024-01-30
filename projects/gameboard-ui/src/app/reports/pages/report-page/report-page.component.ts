import { ReportKey, ReportMetaData, ReportViewModel } from '@/reports/reports-models';
import { ReportsService } from '@/reports/reports.service';
import { ActiveReportService } from '@/reports/services/active-report.service';
import { RouterService } from '@/services/router.service';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss']
})
export class ReportPageComponent {
  protected report$?: Observable<ReportViewModel | null>;
  protected metaData$: Observable<ReportMetaData | null> = this
    .activeReportService
    .metaData$;

  constructor(
    private activeReportService: ActiveReportService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private routerService: RouterService) {
  }

  handleReportSelect(key?: ReportKey) {
    if (key)
      this.displayReport(key);
  }

  async handleExportToCsv() {
    if (!this.activeReportService.metaData$.value?.key)
      throw new Error("Can't export a report with unspecified key");

    const queryParams = await firstValueFrom(this.route.queryParams);
    this.reportsService.openExport(
      this.activeReportService.metaData$.value?.key,
      { ...queryParams }
    );
  }

  private displayReport(reportKey: ReportKey, query: Object | null = null) {
    this.activeReportService.metaData$.next(null);
    this.routerService.toReport(reportKey, query);
  }
}
