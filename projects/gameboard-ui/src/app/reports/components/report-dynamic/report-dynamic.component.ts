import { AfterViewInit, Component, ComponentRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription, combineLatest, forkJoin, from, } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ReportViewModel, ReportMetaData, ReportKey } from '../../reports-models';
import { DynamicReportDirective } from '../../directives/dynamic-report.directive';
import { ChallengesReportComponent } from '../challenges-report/challenges-report.component';
import { IReportComponent } from '../report-component';
import { LogService } from '../../../services/log.service';
import { PdfService } from '../../../services/pdf.service';
import { PlayersReportComponent } from '../players-report/players-report.component';
import { UriService } from '../../../services/uri.service';

@Component({
  selector: 'app-report-dynamic',
  templateUrl: './report-dynamic.component.html',
  styleUrls: ['./report-dynamic.component.scss']
})
export class ReportDynamicComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DynamicReportDirective, { read: DynamicReportDirective }) dynamicReportHost!: DynamicReportDirective;
  private loadedReportComponent?: ComponentRef<IReportComponent<any>>
  private routerEventsSub?: Subscription;
  protected isAtReportsRoot = false;
  reportMetaData?: ReportMetaData;

  private static reportComponentMap: { [reportKey: string]: any } = {
    'challenges-report': ChallengesReportComponent,
    'players-report': PlayersReportComponent,
  };

  protected report$?: Observable<ReportViewModel | null>;

  constructor(
    private logService: LogService,
    private pdfService: PdfService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private router: Router,
    private uriService: UriService) {
    this.routerEventsSub = router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        const typedEvent = ev as NavigationEnd;
        this.isAtReportsRoot = typedEvent.url.endsWith("/reports");
      }
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
            const componentRef = viewContainerRef.createComponent<IReportComponent<any>>(ReportDynamicComponent.reportComponentMap[report.key]);
            // have to deep-clone the query parameters because they're made inextensible by angular
            componentRef.instance.selectedParameters = { ...this.route.snapshot.queryParams };
            componentRef.instance.onResultsLoaded = (metaData: ReportMetaData) => { this.reportMetaData = metaData };
            this.loadedReportComponent = componentRef;
          }
        })
      );
  }

  handleResetParameters() {
    if (!this.loadedReportComponent?.instance) {
      throw new Error("Can't run without a loaded report.");
    }

    const key = this.loadedReportComponent.instance.getReportKey();
    this.router.navigateByUrl(`reports/${key}`);
  }

  handleRunReport() {
    if (!this.loadedReportComponent) {
      throw new Error("Can't run without a loaded report.");
    }

    const key = this.loadedReportComponent.instance.getReportKey();
    const query = this.loadedReportComponent.instance.getParametersQuery();

    this.displayReport(key, query);
  }

  handleExportToCsv() {
    console.log("exporting...")
    if (!this.loadedReportComponent?.instance) {
      throw new Error("Can't export without a loaded report.");
    }

    this.reportsService.openExport(this.loadedReportComponent.instance.getReportKey(), this.loadedReportComponent.instance.selectedParameters);
  }

  handleExportToPdf() {
    const exportElement = this.loadedReportComponent?.instance?.getPdfExportElement();

    if (!exportElement) {
      this.logService.logError("Couldn't resolve element ref for PDF export.");
      return;
    }

    this.pdfService.exportHtmlToPdf(this.reportMetaData?.title || "Report", exportElement);
  }

  private displayReport(reportKey: string, query: string | null) {
    this.router.navigateByUrl(`reports/${reportKey}?${query || ''}`);
  }

  ngOnDestroy(): void {
    this.routerEventsSub?.unsubscribe();
  }
}
