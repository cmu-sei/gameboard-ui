import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom, from, map } from 'rxjs';
import { ReportKey, ReportMetaData, ReportViewModel } from '@/reports/reports-models';
import { ReportsService } from '@/reports/reports.service';
import { ActiveReportService } from '@/reports/services/active-report.service';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss']
})
export class ReportPageComponent implements OnInit {
  protected metaData$ = this
    .activeReportService
    .metaData$;
  protected reports$ = from(this.reportsService.list())
    .pipe(
      map(reports => reports.map(r => ({
        key: r.key as ReportKey,
        name: r.name
      })))
    );
  protected report$?: Observable<ReportViewModel | null>;

  constructor(
    private activeReportService: ActiveReportService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private routerService: RouterService) {
  }

  async ngOnInit(): Promise<void> {

  }

  protected handleReportSelect(key: string) {
    this.displayReport(key as ReportKey);
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

  private async displayReport(reportKey: ReportKey, query: Object | null = null) {
    const metadata = await firstValueFrom(this.reportsService.getReportMetaData(reportKey));
    this.activeReportService.metaData$.next(metadata);
    this.routerService.toReport(reportKey, query);
  }
}
