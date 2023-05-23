import { AfterViewInit, Component, ElementRef, Input, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { ReportKey, ReportMetaData } from '../../../reports-models';
import { IReportComponent } from '../../report-component';
import { ChallengesReportParameters, ChallengesReportModel, ChallengesReportRecord, ChallengesReportFlatParameters } from './challenges-report.models';
import { ChallengesReportService } from '../../../services/challenges-report-service';
import { DoughnutChartConfig } from '@/core/components/doughnut-chart/doughnut-chart.component';

@Component({
  selector: 'app-challenge-report',
  templateUrl: './challenges-report.component.html',
  styleUrls: ['./challenges-report.component.scss']
})
export class ChallengesReportComponent implements IReportComponent<ChallengesReportFlatParameters, ChallengesReportParameters, ChallengesReportRecord>, AfterViewInit, OnDestroy {
  @Input() onResultsLoaded!: (metadata: ReportMetaData) => void;

  selectedParameters: ChallengesReportParameters = { dateRange: {}, gameChallengeSpec: {}, track: {} };

  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")
  @ViewChildren('challengesReport', { read: ElementRef<HTMLDivElement> }) protected viewContainerRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private reportElementRef?: ElementRef<HTMLDivElement>;
  private viewContainerRefsSub?: Subscription;

  protected ctx$: Observable<ChallengesReportModel>;
  protected chartConfig?: DoughnutChartConfig;

  constructor(
    private route: ActivatedRoute,
    public reportService: ChallengesReportService) {

    this.ctx$ = this.route.queryParams.pipe(
      map(params => ({ ...params } as ChallengesReportParameters)),
      switchMap(args => this.reportService.getReportData(args)),
      tap(results => this.onResultsLoaded(results.metaData)),
      tap(results => this.chartConfig = this.buildDoughnutChart(results))
    );
  }

  ngAfterViewInit(): void {
    this.viewContainerRefs!.changes.subscribe(item => {
      this.reportElementRef = this.viewContainerRefs ? this.viewContainerRefs.get(0) : undefined;
    })
  }

  buildParameters(query: ChallengesReportParameters): ChallengesReportParameters {
    return query;
  }

  flattenParameters(parameters: ChallengesReportParameters): ChallengesReportParameters {
    return parameters;
  }

  getPdfExportElement(): ElementRef<HTMLDivElement> {
    return this.reportElementRef!;
  }

  getReportKey(): ReportKey {
    return ReportKey.ChallengesReport;
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
