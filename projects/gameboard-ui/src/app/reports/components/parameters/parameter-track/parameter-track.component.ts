import { Component, Input, OnInit } from '@angular/core';
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
export class ParameterTrackComponent extends ReportParameterComponent implements OnInit {
  @Input() hideModifierSelect = false;
  tracks$: Observable<string[]>

  competedIn = ReportTrackParameterModifier.CompetedInThisTrack;
  competedOnlyIn = ReportTrackParameterModifier.CompetedInOnlyThisTrack;
  didntCompeteIn = ReportTrackParameterModifier.DidntCompeteInThisTrack;

  constructor(private reportsService: ReportsService) {
    super();
    this.tracks$ = this.reportsService.getTrackOptions();
  }

  ngOnInit(): void {
    this.ngModel = {
      track: undefined,
      modifier: this.competedIn
    };
  }

  handleSelectionChanged(event?: any) {
    console.log("track model is", this.ngModel);
    this.ngModelChange.emit(this.ngModel);
    // console.log("Writing", {
    //   track: this.selectedTrack,
    //   modifier: this.hideModifierSelect ? this.competedIn : this.selectedModifier
    // });

    // this.selectedValue = {
    //   track: this.selectedTrack,
    //   modifier: this.hideModifierSelect ? this.competedIn : this.selectedModifier
    // } as ReportTrackParameter;
  }

  // writeValue(obj: any): void {
  //   const typedValue = obj as ReportTrackParameter;
  //   this.selectedValue = typedValue;
  //   this.handleSelectionChanged();
  // }
}
