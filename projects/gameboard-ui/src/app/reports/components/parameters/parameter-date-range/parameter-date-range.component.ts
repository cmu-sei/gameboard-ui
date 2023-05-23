import { Component, Input } from '@angular/core';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { ReportDateRange } from '../../../reports-models';

@Component({
  selector: 'app-parameter-date-range',
  templateUrl: './parameter-date-range.component.html',
  styleUrls: ['./parameter-date-range.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterDateRangeComponent)]
})
export class ParameterDateRangeComponent extends ReportParameterComponent<ReportDateRange> {
  @Input() label = "Date range";

  handleModelChanged(event?: any) {
  }
}
