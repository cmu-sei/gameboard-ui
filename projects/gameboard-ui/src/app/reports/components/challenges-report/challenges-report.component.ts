import { AfterViewInit, Component, ElementRef, Input, OnDestroy, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { UriService } from '../../../services/uri.service';
import { DoughnutChartConfig, ReportKey, ReportMetaData, ReportParameters } from '../../reports-models';
import { ReportsService } from '../../reports.service';
import { IReportComponent } from '../report-component';
import { ChallengesReportArgs, ChallengesReportModel } from './challenges-report.models';

@Component({
  selector: 'app-challenge-report',
  templateUrl: './challenges-report.component.html',
  styleUrls: ['./challenges-report.component.scss']
})
export class ChallengesReportComponent implements IReportComponent<ChallengesReportArgs>, AfterViewInit, OnDestroy {
  @Input() onResultsLoaded!: (metadata: ReportMetaData) => void;
  selectedParameters: ChallengesReportArgs = {};

  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")
  @ViewChildren('challengesReport', { read: ElementRef<HTMLDivElement> }) protected viewContainerRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private reportElementRef?: ElementRef<HTMLDivElement>;
  private viewContainerRefsSub?: Subscription;

  protected ctx$: Observable<ChallengesReportModel>;
  protected chartConfig?: DoughnutChartConfig;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private uriService: UriService,
    reportsService: ReportsService) {

    this.ctx$ = this.route.queryParams.pipe(
      map(params => ({ ...params } as ChallengesReportArgs)),
      switchMap(args => reportsService.getChallengesReport(args)),
      tap(results => this.onResultsLoaded(results.metaData)),
      tap(results => this.chartConfig = this.buildDoughnutChart(results))
    );
  }

  ngAfterViewInit(): void {
    this.viewContainerRefs!.changes.subscribe(item => {
      this.reportElementRef = this.viewContainerRefs ? this.viewContainerRefs.get(0) : undefined;
    })
  }

  getParametersQuery(): string {
    return this.uriService.uriEncode(this.selectedParameters);
  }

  getPdfExportElement(): ElementRef<HTMLDivElement> {
    return this.reportElementRef!;
  }

  getReportKey(): ReportKey {
    return ReportKey.ChallengesReport;
  }

  handleReportParametersChanged(parameters: ReportParameters) {
    const reportKey = this.route.snapshot.params['reportKey'];

    // TODO: daterange requires additional handling because it's an object
    let finalParams = { ...parameters };
    delete finalParams.dateRange;

    // TODO: use reportkey enum, have the parent component nav
    this.router.navigateByUrl(`/reports/${reportKey}?${this.uriService.toQueryString(finalParams)}`);
  }

  resetParameters(): void {
    this.selectedParameters = {};
  }

  private buildDoughnutChart(results: ChallengesReportModel): DoughnutChartConfig {
    const allPartial = results.records.map(r => r.playersWithPartialSolve).reduce((a, b) => a + b, 0);
    const allComplete = results.records.map(r => r.playersWithCompleteSolve).reduce((a, b) => a + b, 0);
    const allStarted = results.records.map(r => r.playersStarted).reduce((a, b) => a + b, 0);
    const allEligible = results.records.map(r => r.playersEligible).reduce((a, b) => a + b, 0);

    return {
      labels: [
        'Complete',
        'Partial',
        'Started (Unsolved)',
        'Didn\'t start'
      ],
      dataSets: [{
        label: 'Solves',
        data: [
          allComplete,
          allPartial,
          (allStarted - allPartial - allComplete),
          (allEligible - allStarted - allPartial - allComplete)
        ],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(3, 182, 252)'
        ],
        hoverOffset: 4
      }],
      options: {
        responsive: true
      }
    };
  }

  ngOnDestroy(): void {
    this.viewContainerRefsSub?.unsubscribe();
  }
}
