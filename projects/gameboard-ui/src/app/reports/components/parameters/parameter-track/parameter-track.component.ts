import { Component, Input } from '@angular/core';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { Observable } from 'rxjs';
import { ReportsService } from '../../../reports.service';
import { ReportTrackParameter, ReportTrackParameterModifier } from '../../../reports-models';

@Component({
  selector: 'app-parameter-track',
  templateUrl: './parameter-track.component.html',
  styleUrls: ['./parameter-track.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterTrackComponent)]
})
export class ParameterTrackComponent extends ReportParameterComponent<ReportTrackParameter> {
  @Input() hideModifierSelect = false;
  tracks$: Observable<string[]>

  competedIn = ReportTrackParameterModifier.CompetedInThisTrack;
  competedOnlyIn = ReportTrackParameterModifier.CompetedInOnlyThisTrack;
  didntCompeteIn = ReportTrackParameterModifier.DidntCompeteInThisTrack;

  constructor(private reportsService: ReportsService) {
    super();

    this.tracks$ = this.reportsService.getTrackOptions();
    this.ngModel = {
      track: undefined,
      modifier: this.competedIn
    };
  }

  handleSelectionChanged(event?: any) {
    this.ngModelChange.emit(this.ngModel);
  }
}
