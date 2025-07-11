import { Component, Input, SimpleChanges } from '@angular/core';
import { EnrollmentReportFlatParameters, EnrollmentReportLineChartViewModel } from '../enrollment-report.models';
import { EnrollmentReportService } from '../enrollment-report.service';
import { LineChartConfig } from '@/core/components/line-chart/line-chart.component';

@Component({
    selector: 'app-enrollment-report-trend',
    templateUrl: './enrollment-report-trend.component.html',
    styleUrls: ['./enrollment-report-trend.component.scss'],
    standalone: false
})
export class EnrollmentReportTrendComponent {
  @Input() parameters: EnrollmentReportFlatParameters | null = null;

  protected chartConfig?: LineChartConfig;
  protected groupByGame = false;

  constructor(private enrollmentReportService: EnrollmentReportService) { }

  async ngOnChanges(changes: SimpleChanges) {
    if (!changes.parameters)
      return;

    await this.loadChart();
  }

  protected async handleGroupByGameChange() {
    await this.loadChart();
  }

  private async loadChart() {
    const lineChartResults = await this.enrollmentReportService.getTrendData(this.parameters);
    if (this.groupByGame) {
      this.buildLineChartByGameByDate(lineChartResults);
    } else {
      this.buildLineChartByDate(lineChartResults);
    }
  }

  private buildLineChartByDate(viewModel: EnrollmentReportLineChartViewModel) {
    const baseConfig = this.buildChartBaseConfig();
    baseConfig.data = {
      labels: Array.from(viewModel.byDate.keys()).map(k => k as any),
      datasets: [
        {
          label: "Enrolled players",
          data: Array.from(viewModel.byDate.values()),
          pointBackgroundColor: "#fff",
          pointBorderColor: "#41ad57"
        },
      ]
    };

    this.chartConfig = baseConfig;
  }

  private buildLineChartByGameByDate(viewModel: EnrollmentReportLineChartViewModel) {
    const baseConfig = this.buildChartBaseConfig();
    baseConfig.data = {
      labels: Array.from(viewModel.byDate.keys()).map(k => k as any),
      datasets: Array.from(viewModel.byGameByDate.keys()).map(gameId => ({
        label: viewModel.gameNames[gameId],
        data: Array.from(viewModel.byGameByDate.get(gameId)!.values())
      }))
    };

    this.chartConfig = baseConfig;
  }

  private buildChartBaseConfig(): LineChartConfig {
    return {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#fff"
            },
          }
        },
        scales: {
          x: {
            type: "time",
            time: {
              displayFormats: {
                day: "MM/dd/yy",
              },
              tooltipFormat: 'DD',
              unit: "day"
            },
            ticks: {
              color: "#fff",
              font: { size: 14 },
              maxTicksLimit: 10,
            },
            title: {
              color: "#fff",
              display: true,
              font: { weight: "bold" },
              padding: 12,
              text: "ENROLLMENT DATE"
            }
          },
          y: {
            title: {
              color: "#fff",
              display: true,
              padding: 12,
              font: { weight: "bold" },
              text: "PLAYERS ENROLLED",
            },
            ticks: {
              color: "#fff",
              maxTicksLimit: 10,
              font: { size: 14 }
            }
          }
        }
      }
    };
  }
}
