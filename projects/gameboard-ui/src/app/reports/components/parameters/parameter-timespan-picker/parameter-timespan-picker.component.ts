import { Component, Input } from '@angular/core';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { ReportTimeSpan } from '@/reports/reports-models';

@Component({
  selector: 'app-parameter-timespan-picker',
  templateUrl: './parameter-timespan-picker.component.html',
  styleUrls: ['./parameter-timespan-picker.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterTimespanPickerComponent)]
})
export class ParameterTimespanPickerComponent extends ReportParameterComponent<ReportTimeSpan> {
  @Input() label = '';

  override getDefaultValue(): ReportTimeSpan | undefined {
    return {};
  }

  handleModelChange() {
    this.ngModelChange.emit(this.ngModel);
  }
}
