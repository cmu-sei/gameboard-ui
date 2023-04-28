import { Component, Input } from '@angular/core';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { Observable } from 'rxjs';
import { ReportsService } from '../../reports.service';
import { ReportTrackParameter, ReportTrackParameterModifier } from '../../reports-models';

@Component({
  selector: 'app-parameter-track',
  templateUrl: './parameter-track.component.html',
  styleUrls: ['./parameter-track.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterTrackComponent)]
})
export class ParameterTrackComponent extends ReportParameterComponent {
  @Input() hideModifierSelect = false;
  tracks$: Observable<string[]>
  selectedTrack?: string;
  selectedModifier?: ReportTrackParameterModifier = ReportTrackParameterModifier.CompetedInThisTrack;

  competedIn = ReportTrackParameterModifier.CompetedInThisTrack;
  competedOnlyIn = ReportTrackParameterModifier.CompetedInOnlyThisTrack;
  didntCompeteIn = ReportTrackParameterModifier.DidntCompeteInThisTrack;

  constructor(private reportsService: ReportsService) {
    super();
    this.tracks$ = this.reportsService.getTrackOptions();
  }

  handleSelectionChanged(event?: any) {
    this.selectedValue = {
      track: this.selectedTrack,
      modifier: this.hideModifierSelect ? this.competedIn : this.selectedModifier
    } as ReportTrackParameter;
  }

  writeValue(obj: any): void {
    const typedValue = obj as ReportTrackParameter;
    this.selectedTrack = typedValue.track;
    this.selectedModifier = typedValue.modifier;
    this.handleSelectionChanged();
  }
}
