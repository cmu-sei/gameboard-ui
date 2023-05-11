import { AfterViewInit, Component, ComponentRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription, combineLatest, from, } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ReportViewModel, ReportMetaData, ReportKey } from '../../reports-models';
import { DynamicReportDirective } from '../../directives/dynamic-report.directive';
import { IReportComponent } from '../report-component';
import { LogService } from '../../../services/log.service';
import { PdfService } from '../../../services/pdf.service';
import { UriService } from '../../../services/uri.service';
import { ObjectService } from '../../../services/object.service';

@Component({
  selector: 'app-report-dynamic',
  templateUrl: './report-dynamic.component.html',
  styleUrls: ['./report-dynamic.component.scss']
})
export class ReportDynamicComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DynamicReportDirective, { read: DynamicReportDirective }) dynamicReportHost!: DynamicReportDirective;
  private loadedReportComponent?: ComponentRef<IReportComponent<any, any, any>>
  private routerEventsSub?: Subscription;
  protected selectedReportKey?: ReportKey;
  protected isAtReportsRoot = false;
  reportMetaData?: ReportMetaData;

  protected report$?: Observable<ReportViewModel | null>;

  constructor(
    private logService: LogService,
    private objectService: ObjectService,
    private pdfService: PdfService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private router: Router,
    private uriService: UriService) {
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
            const reportComponentParameters = componentRef.instance.reportService.unflattenParameters({ ...this.route.snapshot.queryParams });
            componentRef.instance.selectedParameters = { ...componentRef.instance.selectedParameters, ...reportComponentParameters };
            componentRef.instance.onResultsLoaded = (metaData: ReportMetaData) => { this.reportMetaData = metaData };
            this.loadedReportComponent = componentRef;
            this.handleRunReport();
          }
        })
      );
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
    const query = this.loadedReportComponent.instance.reportService.flattenParameters(this.loadedReportComponent.instance.selectedParameters);
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
    this.router.navigateByUrl(`reports/${reportKey}${this.uriService.toQueryString(query)}`);
  }

  ngOnDestroy(): void {
    this.routerEventsSub?.unsubscribe();
  }
}
