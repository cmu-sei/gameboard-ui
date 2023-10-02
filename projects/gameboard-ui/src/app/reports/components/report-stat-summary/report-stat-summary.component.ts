import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

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
export class ReportStatSummaryComponent implements OnChanges {
  @Input() importantStat?: ReportSummaryStat;
  @Input() stats: ReportSummaryStat[] = [];

  protected allStats: ReportSummaryStat[] = [];
  protected isCollapsed = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.allStats = [
      this.importantStat,
      ...this.stats
    ].filter(e => !!e) as ReportSummaryStat[];
  }
}
