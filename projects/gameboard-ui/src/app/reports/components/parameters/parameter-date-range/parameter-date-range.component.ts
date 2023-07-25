import { Component, Input } from '@angular/core';
import { FontAwesomeService } from '@/services/font-awesome.service';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '@/core/components/custom-input/custom-input.component';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';

@Component({
  selector: 'app-parameter-date-range',
  templateUrl: './parameter-date-range.component.html',
  styleUrls: ['./parameter-date-range.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterDateRangeComponent)]
})
export class ParameterDateRangeComponent extends CustomInputComponent<DateRangeQueryParamModel> {
  @Input() label = "Date range";

  constructor(public faService: FontAwesomeService) {
    super();
  }

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
