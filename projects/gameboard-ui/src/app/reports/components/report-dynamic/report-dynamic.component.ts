import { AfterViewInit, Component, ComponentRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription, combineLatest, from, } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ReportViewModel, ReportMetaData, ReportKey } from '../../reports-models';
import { DynamicReportDirective } from '../../directives/dynamic-report.directive';
import { IReportComponent } from '../report-component';
import { LogService } from '@/services/log.service';
import { PdfService } from '@/services/pdf.service';
import { ObjectService } from '@/services/object.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ApiUrlService } from '@/services/api-url.service';

@Component({
  selector: 'app-report-dynamic',
  templateUrl: './report-dynamic.component.html',
  styleUrls: ['./report-dynamic.component.scss']
})
export class ReportDynamicComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DynamicReportDirective, { read: DynamicReportDirective }) dynamicReportHost!: DynamicReportDirective;
  private loadedReportComponent?: ComponentRef<IReportComponent<any, any, any>>;
  private routerEventsSub?: Subscription;
  protected selectedReportKey?: ReportKey;
  protected isAtReportsRoot = false;
  reportMetaData?: ReportMetaData;

  protected report$?: Observable<ReportViewModel | null>;

  constructor(
    private apiUrl: ApiUrlService,
    private modalService: ModalConfirmService,
    private logService: LogService,
    private objectService: ObjectService,
    private pdfService: PdfService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private router: Router) {
    this.routerEventsSub = router.events
      .pipe(
        filter(ev => ev instanceof NavigationEnd),
        map(ev => ev as NavigationEnd)
      ).subscribe(ev => {
        this.isAtReportsRoot = ev.url.endsWith("/reports");
      });
  }

  ngAfterViewInit(): void {
    this.report$ =
      combineLatest([
        this.route.params,
        this.route.queryParams
      ]).pipe(
        map(([params, queryParams]) => ({ params, queryParams })),
        switchMap(route => from(this.reportsService.get(route.params.reportKey))),
        tap((report: ReportViewModel | null) => {
          // unload any prior component
          const viewContainerRef = this.dynamicReportHost.viewContainerRef;
          viewContainerRef.clear();

          // load the new report and set its properties/parameters
          if (report) {
            const reportComponentType = this.reportsService.getComponentForReport(report.key as ReportKey);
            const componentRef = viewContainerRef.createComponent<IReportComponent<any, any, any>>(reportComponentType);

            // have to deep-clone the query parameters because they're made inextensible by angular
            const reportComponentParameters = componentRef.instance.enrollmentReportService.unflattenParameters({ ...this.route.snapshot.queryParams });
            this.logService.logInfo("Loading report params:", reportComponentParameters);
            componentRef.instance.selectedParameters = { ...componentRef.instance.selectedParameters, ...reportComponentParameters };
            this.loadedReportComponent = componentRef;
            // this.handleRunReport();

            this.selectedReportKey = ReportKey[report.key as keyof typeof ReportKey];
          }
        })
      );
  }

  handleAboutFiltersClick() {
    this.modalService.openConfirm({
      title: "About report filters",
      bodyContent: `
        You can use filters to constrain the data that a report includes. For example, if you're interested in seeing only enrollments from a given sponsor (or subset of sponsors)
        in the Enrollment report, you can use the Sponsors filter to select the sponsors you're interested in. If you don't choose any values in the Sponsors filter, data from all
        sponsors will be included.

        When you run a report, your browser will generate a URL that represents your filter selections for the current report. If you want to share what you're seeing with another
        Gameboard user, you can either copy the link in your browser's address bar (or click the "Copy" button) and send it to them.
      `,
      renderBodyAsMarkdown: true
    });
  }

  handleResetParameters() {
    if (!this.loadedReportComponent?.instance) {
      throw new Error("Can't reset without a loaded report.");
    }

    const key = this.loadedReportComponent.instance.getReportKey();
    this.displayReport(key);
  }

  handleRunReport() {
    if (!this.loadedReportComponent) {
      throw new Error("Can't run without a loaded report.");
    }

    const key = this.loadedReportComponent.instance.getReportKey();
    const query = this.loadedReportComponent.instance.enrollmentReportService.flattenParameters(this.loadedReportComponent.instance.selectedParameters);
    const cleanQuery = this.objectService.cloneTruthyKeys(query);

    this.displayReport(key, cleanQuery);
  }

  handleReportSelect(key?: ReportKey) {
    if (key)
      this.displayReport(key?.toString());
  }

  handleExportToCsv() {
    if (!this.loadedReportComponent?.instance) {
      throw new Error("Can't export without a loaded report.");
    }

    this.reportsService.openExport(
      this.loadedReportComponent.instance.getReportKey(),
      this.loadedReportComponent.instance.selectedParameters
    );
  }

  handleExportToPdf() {
    const exportElement = this.loadedReportComponent?.instance?.getPdfExportElement();

    if (!exportElement) {
      this.logService.logError("Couldn't resolve element ref for PDF export.");
      return;
    }

    this.pdfService.exportHtmlToPdf(this.reportMetaData?.title || "Report", exportElement);
  }

  private displayReport(reportKey: string, query: Object | null = null) {
    this.router.navigateByUrl(`reports/${reportKey}${this.apiUrl.objectToQuery(query)}`);
  }

  ngOnDestroy(): void {
    this.routerEventsSub?.unsubscribe();
  }
}
