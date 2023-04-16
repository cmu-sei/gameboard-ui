import { Component, ElementRef, Input, OnDestroy, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { LogService } from '../../../services/log.service';
import { PdfService } from '../../../services/pdf.service';
import { UriService } from '../../../services/uri.service';
import { ReportMetaData, ReportParameters } from '../../reports-models';
import { ReportsService } from '../../reports.service';
import { IReportComponent } from '../report-component';
import { ChallengesReportArgs, ChallengesReportModel } from './challenges-report.models';

@Component({
  selector: 'app-challenge-report',
  templateUrl: './challenges-report.component.html',
  styleUrls: ['./challenges-report.component.scss']
})
export class ChallengesReportComponent implements IReportComponent, OnDestroy {
  @Input() onResultsLoaded!: (metadata: ReportMetaData) => void;

  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")
  @ViewChildren('challengesReport', { read: ElementRef<HTMLDivElement> }) protected viewContainerRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private reportElementRef?: ElementRef<HTMLDivElement>;
  private viewContainerRefsSub?: Subscription;

  protected ctx$: Observable<ChallengesReportModel>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logService: LogService,
    private pdfService: PdfService,
    private uriService: UriService,
    reportsService: ReportsService) {

    this.ctx$ = this.route.queryParams.pipe(
      map(params => ({ ...params } as ChallengesReportArgs)),
      switchMap(args => reportsService.getChallengesReport(args)),
      tap(results => this.onResultsLoaded(results.metaData))
    );
  }

  ngAfterViewInit(): void {
    this.viewContainerRefs!.changes.subscribe(item => {
      this.reportElementRef = this.viewContainerRefs ? this.viewContainerRefs.get(0) : undefined;
    })
  }

  exportToPdf() {
    if (!this.reportElementRef?.nativeElement) {
      this.logService.logError("Couldn't isolate element ref for the challenges report.");
      return;
    }

    this.pdfService.exportHtmlToPdf("Challenges Report", this.reportElementRef);
  }

  handleReportParametersChanged(parameters: ReportParameters) {
    const reportKey = this.route.snapshot.params['reportSlug'];

    // TODO: daterange requires additional handling because it's an object
    const finalParams = { ...parameters, dateRange: undefined };

    this.router.navigateByUrl(`/reports/${reportKey}?${this.uriService.toQueryString(finalParams)}`);
  }

  ngOnDestroy(): void {
    this.viewContainerRefsSub?.unsubscribe();
  }
}
