import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, from } from 'rxjs';
import { ReportKey } from '@/reports/reports-models';
import { ReportViewModel } from '@/reports/reports-models';
import { ReportsService } from '@/reports/reports.service';

@Component({
  selector: 'app-report-select',
  templateUrl: './report-select.component.html',
  styleUrls: ['./report-select.component.scss']
})
export class ReportSelectComponent {
  @Input() selectedReportKey?: ReportKey;
  @Output() reportSelect = new EventEmitter<ReportKey>();
  reports$: Observable<ReportViewModel[]>;

  constructor(private reportsService: ReportsService) {
    this.reports$ = from(reportsService.list());
  }

  handleChange(event$: Event) {
    this.reportSelect.emit(this.selectedReportKey);
  }
}
