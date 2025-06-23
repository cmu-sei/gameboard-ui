import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SupportReportService } from '@/reports/components/reports/support-report/support-report.service';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '@/core/components/custom-input/custom-input.component';

@Component({
    selector: 'app-parameter-ticket-status',
    templateUrl: './parameter-ticket-status.component.html',
    styleUrls: ['./parameter-ticket-status.component.scss'],
    providers: [createCustomInputControlValueAccessor(ParameterTicketStatusComponent)],
    standalone: false
})
export class ParameterTicketStatusComponent extends CustomInputComponent<string> implements OnInit {
  statuses$: Observable<string[]> = of([]);

  constructor(private supportReportService: SupportReportService) {
    super();
  }

  ngOnInit(): void {
    this.statuses$ = this.supportReportService.getTicketStatuses();
  }
}
