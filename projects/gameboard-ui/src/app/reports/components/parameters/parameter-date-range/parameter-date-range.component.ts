import { Component, Input } from '@angular/core';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '@/core/components/custom-input/custom-input.component';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { fa } from "@/services/font-awesome.service";


@Component({
  selector: 'app-parameter-date-range',
  templateUrl: './parameter-date-range.component.html',
  styleUrls: ['./parameter-date-range.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterDateRangeComponent)]
})
export class ParameterDateRangeComponent extends CustomInputComponent<DateRangeQueryParamModel> {
  @Input() label = "Date range";

  protected fa = fa;

  handleStartDateClear() {
    if (this.ngModel) {
      this.ngModel.dateStart = null;
    }
  }

  handleEndDateClear() {
    if (this.ngModel) {
      this.ngModel.dateEnd = null;
    }
  }
}
