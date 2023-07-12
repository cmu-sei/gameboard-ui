import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportsService } from '@/reports/reports.service';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';

@Component({
  selector: 'app-parameter-ticket-status',
  templateUrl: './parameter-ticket-status.component.html',
  styleUrls: ['./parameter-ticket-status.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterTicketStatusComponent)]
})
export class ParameterTicketStatusComponent extends ReportParameterComponent<string> implements OnInit {
  statuses$: Observable<string[]> = of([]);

  constructor(private reportsService: ReportsService) {
    super();
  }

  ngOnInit(): void {
    this.statuses$ = this.reportsService.getTicketStatuses();
  }
}
