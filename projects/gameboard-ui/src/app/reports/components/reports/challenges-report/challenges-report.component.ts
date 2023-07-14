import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, map, Observable, of, Subscription } from 'rxjs';
import { ReportComponentBase } from '../report-base.component';
import { ChallengesReportParameters, ChallengesReportModel, ChallengesReportRecord, ChallengesReportFlatParameters } from './challenges-report.models';
import { ChallengesReportService } from '@/reports/services/challenges-report-service';
import { DoughnutChartConfig } from '@/core/components/doughnut-chart/doughnut-chart.component';
import { ActiveReportService } from '@/reports/services/active-report.service';
import { ReportViewUpdate } from '@/reports/reports-models';

@Component({
  selector: 'app-challenge-report',
  templateUrl: './challenges-report.component.html',
  styleUrls: ['./challenges-report.component.scss']
})
export class ChallengesReportComponent extends ReportComponentBase<ChallengesReportParameters, ChallengesReportRecord> implements AfterViewInit, OnDestroy {
  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")
  @ViewChildren('challengesReport', { read: ElementRef<HTMLDivElement> }) protected viewContainerRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private reportElementRef?: ElementRef<HTMLDivElement>;
  private viewContainerRefsSub?: Subscription;

  protected ctx$?: Observable<ChallengesReportModel>;
  protected chartConfig?: DoughnutChartConfig;

  constructor(
    activeReportService: ActiveReportService,
    private route: ActivatedRoute,
    public reportService: ChallengesReportService) {
    super(activeReportService);
  }

  async ngAfterViewInit(): Promise<void> {
    await this.updateView(this.selectedParameters);
    this.viewContainerRefs!.changes.subscribe(item => {
      this.reportElementRef = this.viewContainerRefs ? this.viewContainerRefs.get(0) : undefined;
    });
  }

  ngOnDestroy(): void {
    this.viewContainerRefsSub?.unsubscribe();
  }

  getDefaultParameters(): ChallengesReportParameters {
    return { competition: undefined, registrationDateRange: {}, gameChallengeSpec: {}, track: {} };
  }

  async updateView(parameters: ChallengesReportParameters): Promise<ReportViewUpdate> {
    const results = await firstValueFrom(this.reportService.getReportData(parameters));
    this.chartConfig = this.buildDoughnutChart(results);
    this.ctx$ = of(results);

    return {
      metaData: results.metaData,
      reportContainerRef: this.reportElementRef!
    };
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
}
