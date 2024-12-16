import { Component, Input, SimpleChanges } from '@angular/core';
import { EnrollmentReportFlatParameters, EnrollmentReportLineChartViewModel } from '../enrollment-report.models';
import { EnrollmentReportService } from '../enrollment-report.service';
import { LineChartConfig } from '@/core/components/line-chart/line-chart.component';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-enrollment-report-trend',
  templateUrl: './enrollment-report-trend.component.html',
  styleUrls: ['./enrollment-report-trend.component.scss']
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
    this.chartConfig = {
      type: 'line',
      data: {
        labels: Array.from(viewModel.byDate.keys()).map(k => k as any),
        datasets: [
          {
            label: "Enrolled players",
            data: Array.from(viewModel.byDate.values()).map(g => g.totalCount),
            backgroundColor: 'green',
          },
        ]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              displayFormats: {
                day: "MM/dd/yy",
              },
              tooltipFormat: 'DD',
              unit: "day"
            },
            title: {
              display: true,
              text: "Enrollment Date"
            }
          },
          y: {
            title: {
              display: true,
              text: "Players Enrolled"
            }
          }
        }
      }
    };
  }

  private buildLineChartByGameByDate(viewModel: EnrollmentReportLineChartViewModel) {
    this.chartConfig = {
      type: 'line',
      data: {
        labels: Array.from(viewModel.byDate.keys()).map(k => k as any),
        datasets: Array.from(viewModel.byGameByDate.keys()).map(gameId => ({
          label: viewModel.gameNames[gameId],
          data: Array.from<DateTime>(viewModel.byGameByDate.get(gameId)!.keys()).map(date => {
            const players = viewModel.byGameByDate.get(gameId)?.get(date);
            return players?.totalCount || 0;
          })
        }))
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              displayFormats: {
                day: "MM/dd/yy",
              },
              tooltipFormat: 'DD',
              unit: "day"
            },
            title: {
              display: true,
              text: "Enrollment Date"
            }
          },
          y: {
            title: {
              display: true,
              text: "Players Enrolled"
            }
          }
        }
      }
    };
  }
}
