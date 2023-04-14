import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ReportDateRange } from '../../reports-models';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangeComponent),
      multi: true,
    }
  ]
})
export class DateRangeComponent implements ControlValueAccessor {
  @Input() ngModel?: ReportDateRange;
  @Output() ngModelChange = new EventEmitter<ReportDateRange>();

  protected isDisabled = false;
  protected onTouched = () => { };

  handleNgModelChange(event: any) {
    this.ngModelChange.emit(this.ngModel);
  }

  writeValue(obj: ReportDateRange): void {
    this.ngModel = obj;
  }

  registerOnChange(fn: any): void {
    this.ngModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
