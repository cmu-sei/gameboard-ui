import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReportsService } from '../../../reports.service';
import { Observable } from 'rxjs';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';

@Component({
  selector: 'app-parameter-competition',
  templateUrl: './parameter-competition.component.html',
  styleUrls: ['./parameter-competition.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterCompetitionComponent)]
})
export class ParameterCompetitionComponent extends ReportParameterComponent {
  competitions$: Observable<string[]>

  constructor(private reportsService: ReportsService) {
    super();
    this.competitions$ = this.reportsService.getCompetitionOptions();
  }
}
