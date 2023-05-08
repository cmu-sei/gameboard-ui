import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { SimpleEntity } from '../../../../api/models';
import { ReportsService } from '../../../reports.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';

@Component({
  selector: 'app-parameter-game',
  templateUrl: './parameter-game.component.html',
  styleUrls: ['./parameter-game.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterGameComponent)]
})
export class ParameterGameComponent extends ReportParameterComponent<string> {
  games$: Observable<SimpleEntity[]>

  constructor(private reportsService: ReportsService) {
    super();
    this.games$ = this.reportsService.getGameOptions();
  }
}
