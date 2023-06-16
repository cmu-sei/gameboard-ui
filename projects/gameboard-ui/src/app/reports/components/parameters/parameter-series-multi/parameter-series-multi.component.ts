import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '@/core/components/custom-input/custom-input.component';
import { ReportsService } from '@/reports/reports.service';

@Component({
  selector: 'app-parameter-series-multi',
  templateUrl: './parameter-series-multi.component.html',
  styleUrls: ['./parameter-series-multi.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterSeriesMultiComponent)]
})
export class ParameterSeriesMultiComponent extends CustomInputComponent<string[]> {
  series$: Observable<string[]>;

  constructor(private reportsService: ReportsService) {
    super();
    this.series$ = this.reportsService.getSeries();
    this.ngModel = [];
  }

  handleModelChange(value: string[]) {
    console.log("model change!", value);
  }
}
