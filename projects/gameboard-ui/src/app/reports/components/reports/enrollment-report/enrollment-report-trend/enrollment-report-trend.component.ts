import { Component, Input, SimpleChanges } from '@angular/core';
import { EnrollmentReportFlatParameters, EnrollmentReportLineChartGroup } from '../enrollment-report.models';
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

    const lineChartResults = await this.enrollmentReportService.getTrendData(this.parameters);
    const datasets: { label: any; data: any[]; backgroundColor: string }[] = [];
    const labels: any[] = [];

    if (this.groupByGame) {
      console.log("by game");
    }
    else {
      const playerGroups = new Map<DateTime, EnrollmentReportLineChartGroup>();
      for (const entry of Object.entries(lineChartResults.playerGroups)) {
        playerGroups.set(DateTime.fromISO(entry[0]), entry[1]);
      }

      labels.push(Array.from(playerGroups.keys()).map(k => k as any));
      datasets.push({
        label: "Enrolled players",
        data: Array.from(playerGroups.values()).map(g => g.totalCount),
        backgroundColor: "blue"
      });
    }

    console.log("labels", labels);
    console.log("datasets", datasets);

    this.chartConfig = {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
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
              text: "Players Enrolled" + (this.groupByGame ? " By Game" : "")
            }
          }
        }
      }
    };
  }
}
