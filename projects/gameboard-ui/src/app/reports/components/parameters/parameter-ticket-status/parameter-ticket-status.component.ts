import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { SupportReportService } from '@/reports/services/support-report.service';

@Component({
  selector: 'app-parameter-ticket-status',
  templateUrl: './parameter-ticket-status.component.html',
  styleUrls: ['./parameter-ticket-status.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterTicketStatusComponent)]
})
export class ParameterTicketStatusComponent extends ReportParameterComponent<string> implements OnInit {
  statuses$: Observable<string[]> = of([]);

  constructor(private supportReportService: SupportReportService) {
    super();
  }

  ngOnInit(): void {
    this.statuses$ = this.supportReportService.getTicketStatuses();
  }
}
