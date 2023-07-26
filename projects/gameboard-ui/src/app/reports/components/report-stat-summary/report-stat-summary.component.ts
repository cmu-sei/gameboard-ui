import { Component, Input } from '@angular/core';

export interface ReportSummaryStat {
  label: string;
  value: number | string;
  additionalInfo?: string;
}

@Component({
  selector: 'app-report-stat-summary',
  templateUrl: './report-stat-summary.component.html',
  styleUrls: ['./report-stat-summary.component.scss']
})
export class ReportStatSummaryComponent {
  @Input() stats: ReportSummaryStat[] = [];
}
