import { Component } from '@angular/core';
import { firstValueFrom, map, Observable, of } from 'rxjs';
import { ReportComponentBase } from '../report-base.component';
import { ChallengesReportParameters, ChallengesReportModel, ChallengesReportRecord, ChallengesReportFlatParameters } from './challenges-report.models';
import { ChallengesReportService } from '@/reports/services/challenges-report-service';
import { DoughnutChartConfig } from '@/core/components/doughnut-chart/doughnut-chart.component';
import { ReportViewUpdate } from '@/reports/reports-models';

@Component({
  selector: 'app-challenge-report',
  templateUrl: './challenges-report.component.html',
  styleUrls: ['./challenges-report.component.scss']
})
export class ChallengesReportComponent extends ReportComponentBase<ChallengesReportFlatParameters, ChallengesReportParameters> {
  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")

  protected ctx$?: Observable<ChallengesReportModel>;
  protected chartConfig?: DoughnutChartConfig;

  constructor(
    private reportService: ChallengesReportService) {
    super();
  }

  async updateView(parameters: ChallengesReportFlatParameters): Promise<ReportViewUpdate> {
    const structuredParameters = this.reportService.unflattenParameters(parameters);
    const results = await firstValueFrom(this.reportService.getReportData(structuredParameters));
    this.chartConfig = this.buildDoughnutChart(results.records);

    this.ctx$ = of({
      metaData: results.metaData,
      records: results.records,
      selectedParameters: structuredParameters
    });

    return {
      metaData: results.metaData
    };
  }

  private buildDoughnutChart(records: ChallengesReportRecord[]): DoughnutChartConfig {
    const allPartial = records.map(r => r.playersWithPartialSolve).reduce((a, b) => a + b, 0);
    const allComplete = records.map(r => r.playersWithCompleteSolve).reduce((a, b) => a + b, 0);
    const allStarted = records.map(r => r.playersStarted).reduce((a, b) => a + b, 0);
    const allEligible = records.map(r => r.playersEligible).reduce((a, b) => a + b, 0);

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
