import { Component } from '@angular/core';
import { ReportsService } from '../../../reports.service';
import { Observable } from 'rxjs';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';

@Component({
  selector: 'app-parameter-series',
  templateUrl: './parameter-series.component.html',
  styleUrls: ['./parameter-series.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterSeriesComponent)]
})
export class ParameterSeriesComponent extends ReportParameterComponent<string> {
  series$: Observable<string[]>;

  constructor(private reportsService: ReportsService) {
    super();
    this.series$ = this.reportsService.getSeries();
  }
}