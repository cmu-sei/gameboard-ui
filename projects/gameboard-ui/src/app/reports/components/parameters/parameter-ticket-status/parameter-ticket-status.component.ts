import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportsService } from '@/reports/reports.service';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';

@Component({
  selector: 'app-parameter-ticket-status',
  templateUrl: './parameter-ticket-status.component.html',
  styleUrls: ['./parameter-ticket-status.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterTicketStatusComponent)]
})
export class ParameterTicketStatusComponent extends ReportParameterComponent<string> {
  statuses$: Observable<string[]>

  constructor(private reportsService: ReportsService) {
    super();
    this.statuses$ = this.reportsService.getTicketStatusOptions();
  }
}
