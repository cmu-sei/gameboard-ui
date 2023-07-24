import { Component, Input } from '@angular/core';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { ReportDateRange } from '../../../reports-models';
import { CustomInputComponent } from '@/core/components/custom-input/custom-input.component';
import { FontAwesomeService } from '@/services/font-awesome.service';

@Component({
  selector: 'app-parameter-date-range',
  templateUrl: './parameter-date-range.component.html',
  styleUrls: ['./parameter-date-range.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterDateRangeComponent)]
})
export class ParameterDateRangeComponent extends CustomInputComponent<ReportDateRange> {
  @Input() label = "Date range";

  constructor(public faService: FontAwesomeService) {
    super();
    this.ngModel = {};
  }

  handleModelChange() {
    this.updateNgModel({ ...this.ngModel });
  }

  handleStartDateClear() {
    if (this.ngModel) {
      this.ngModel.dateEnd = undefined;
      this.handleModelChange();
    }
  }

  handleEndDateClear() {
    if (this.ngModel) {
      this.ngModel.dateStart = undefined;
      this.handleModelChange();
    }
  }
}
