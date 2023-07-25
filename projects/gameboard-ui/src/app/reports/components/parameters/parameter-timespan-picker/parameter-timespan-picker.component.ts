import { Component, Input } from '@angular/core';
import { ReportTimeSpan } from '@/reports/reports-models';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '@/core/components/custom-input/custom-input.component';

@Component({
  selector: 'app-parameter-timespan-picker',
  templateUrl: './parameter-timespan-picker.component.html',
  styleUrls: ['./parameter-timespan-picker.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterTimespanPickerComponent)]
})
export class ParameterTimespanPickerComponent extends CustomInputComponent<ReportTimeSpan> {
  @Input() label = '';

  override getDefaultValue(): ReportTimeSpan | null {
    return {};
  }

  handleModelChange() {
    this.ngModelChange.emit(this.ngModel);
  }
}
