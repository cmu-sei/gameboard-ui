import { ReportKey, ReportMetaData, ReportViewModel } from '@/reports/reports-models';
import { ReportsService } from '@/reports/reports.service';
import { ActiveReportService } from '@/reports/services/active-report.service';
import { LogService } from '@/services/log.service';
import { PdfService } from '@/services/pdf.service';
import { RouterService } from '@/services/router.service';
import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, from, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss']
})
export class ReportPageComponent implements AfterViewInit {
  protected report$?: Observable<ReportViewModel | null>;
  protected metaData$: Observable<ReportMetaData | null> = this
    .activeReportService
    .metaData$
    .pipe(tap(m => this.metaData = m!));

  protected metaData: ReportMetaData | null = null;
  private reportTitle?: string;

  constructor(
    private activeReportService: ActiveReportService,
    private logService: LogService,
    private pdfService: PdfService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private routerService: RouterService) {
  }

  ngAfterViewInit(): void {
    this.report$ = this.route.params.pipe(
      switchMap(route => from(this.reportsService.get(route.params.reportKey))),
      tap(report => this.reportTitle = report?.name),
    );
  }

  handleReportSelect(key?: ReportKey) {
    if (key)
      this.displayReport(key);
  }

  handleExportToCsv() {
    if (!this.metaData)
      throw new Error("Can't export a report with unspecified key");

    this.reportsService.openExport(
      this.metaData.key,
      { ...this.route.snapshot.params }
    );
  }

  handleExportToPdf() {
    const exportElement = this.activeReportService.htmlElement$.value;

    if (!exportElement) {
      this.logService.logError("Couldn't resolve element ref for PDF export.");
      return;
    }

    this.pdfService.exportHtmlToPdf(this.reportTitle || "Report", exportElement);
  }

  private displayReport(reportKey: ReportKey, query: Object | null = null) {
    this.routerService.toReport(reportKey, query);
  }
}
