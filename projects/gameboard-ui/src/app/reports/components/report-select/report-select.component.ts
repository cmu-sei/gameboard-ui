import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { ReportKey } from '@/reports/reports-models';
import { ReportsService } from '@/reports/reports.service';

@Component({
  selector: 'app-report-select',
  templateUrl: './report-select.component.html',
})
export class ReportSelectComponent {
  @Input() selectedReportKey?: ReportKey = ReportKey.ChallengesReport;
  @Output() reportSelect = new EventEmitter<ReportKey>();
  reports$: Observable<{ key: string, name: string }[]>;

  constructor(reportsService: ReportsService) {
    this.reports$ = from(reportsService.list())
      .pipe(map(reports => reports.map(r => ({
        key: r.key,
        name: r.name
      }))));
  }

  handleChange(event$: Event) {
    this.reportSelect.emit(this.selectedReportKey);
  }
}
