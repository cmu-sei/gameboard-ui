import { Component, Input } from '@angular/core';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { Observable } from 'rxjs';
import { ReportsService } from '../../../reports.service';
import { ReportTrackParameter, ReportTrackParameterModifier } from '../../../reports-models';

@Component({
  selector: 'app-parameter-track',
  templateUrl: './parameter-track.component.html',
  providers: [createCustomInputControlValueAccessor(ParameterTrackComponent)]
})
export class ParameterTrackComponent extends ReportParameterComponent<ReportTrackParameter> {
  @Input() hideModifierSelect = false;
  tracks$: Observable<string[]>;

  competedIn = ReportTrackParameterModifier.CompetedInThisTrack;
  competedOnlyIn = ReportTrackParameterModifier.CompetedInOnlyThisTrack;
  didntCompeteIn = ReportTrackParameterModifier.DidntCompeteInThisTrack;

  constructor(private reportsService: ReportsService) {
    super();

    this.ngModel = {
      track: undefined,
      modifier: this.competedIn
    };
    this.tracks$ = this.reportsService.getTracks();
  }

  handleSelectionChanged(event?: any) {
    this.ngModelChange.emit(this.ngModel);
  }
}
