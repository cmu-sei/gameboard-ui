import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { EnrollmentReportFlatParameters } from '../enrollment-report.models';
import { EnrollmentReportService } from '../enrollment-report.service';
import { LineChartConfig } from '@/core/components/line-chart/line-chart.component';

@Component({
  selector: 'app-enrollment-report-trend',
  templateUrl: './enrollment-report-trend.component.html',
  styleUrls: ['./enrollment-report-trend.component.scss']
})
export class EnrollmentReportTrendComponent implements OnInit {
  @Input() parameters: EnrollmentReportFlatParameters | null = null;

  protected chartConfig?: LineChartConfig;

  constructor(private enrollmentReportService: EnrollmentReportService) { }

  async ngOnChanges(changes: SimpleChanges) {
    if (!changes.parameters)
      return;

    const lineChartResults = await this.enrollmentReportService.getTrendData(this.parameters);
    this.chartConfig = {
      type: 'line',
      data: {
        labels: Array.from(lineChartResults.keys()).map(k => k as any),
        datasets: [
          {
            label: "Enrolled players",
            data: Array.from(lineChartResults.values()).map(g => g.totalCount),
            backgroundColor: 'blue',
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

  async ngOnInit(): Promise<void> {

  }
}
