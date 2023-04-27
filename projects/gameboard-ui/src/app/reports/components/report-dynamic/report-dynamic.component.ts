import { AfterViewInit, Component, ComponentRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription, from, } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ReportViewModel, ReportMetaData } from '../../reports-models';
import { DynamicReportDirective } from '../../directives/dynamic-report.directive';
import { ChallengesReportComponent } from '../challenges-report/challenges-report.component';
import { IReportComponent } from '../report-component';
import { LogService } from '../../../services/log.service';
import { PdfService } from '../../../services/pdf.service';
import { PlayersReportComponent } from '../players-report/players-report.component';

@Component({
  selector: 'app-report-dynamic',
  templateUrl: './report-dynamic.component.html',
  styleUrls: ['./report-dynamic.component.scss']
})
export class ReportDynamicComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DynamicReportDirective, { read: DynamicReportDirective }) dynamicReportHost!: DynamicReportDirective;
  private loadedReportComponent?: ComponentRef<IReportComponent>
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
    private router: Router) {
    this.routerEventsSub = router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        const typedEvent = ev as NavigationEnd;
        this.isAtReportsRoot = typedEvent.url.endsWith("/reports");
      }
    });
  }

  ngAfterViewInit(): void {
    this.report$ = this.route.params.pipe(
      switchMap(params => from(this.reportsService.get(params.reportKey))),
      tap(report => {
        const viewContainerRef = this.dynamicReportHost.viewContainerRef;
        viewContainerRef.clear();

        if (report) {
          const componentRef = viewContainerRef.createComponent<IReportComponent>(ReportDynamicComponent.reportComponentMap[report.key]);
          componentRef.instance.onResultsLoaded = (metaData: ReportMetaData) => { this.reportMetaData = metaData };
          this.loadedReportComponent = componentRef;
        }
      })
    );
  }

  handleResetParameters() {

  }

  handleRunReport() {
    if (!this.loadedReportComponent) {
      throw new Error("Can't run without a loaded report.");
    }

    const key = this.loadedReportComponent.instance.getReportKey();
    const query = this.loadedReportComponent.instance.getParametersQuery();

    this.router.navigateByUrl(`reports/${key}?${query}`);
  }

  handleExportToCsv() {
    this.logService.logWarning("PDF to CSV NYI.");
  }

  handleExportToPdf() {
    const exportElement = this.loadedReportComponent?.instance?.getPdfExportElement();

    if (!exportElement) {
      this.logService.logError("Couldn't resolve element ref for PDF export.");
      return;
    }

    this.pdfService.exportHtmlToPdf(this.reportMetaData?.title || "Report", exportElement);
  }

  ngOnDestroy(): void {
    this.routerEventsSub?.unsubscribe();
  }
}
