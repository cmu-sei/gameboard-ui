import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SupportService } from 'projects/gameboard-ui/src/app/api/support.service';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { Observable, combineLatest, map, of } from 'rxjs';

@Component({
  selector: 'app-parameter-ticket-labels',
  templateUrl: './parameter-ticket-labels.component.html',
  styleUrls: ['./parameter-ticket-labels.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterTicketLabelsComponent)]
})
export class ParameterTicketLabelsComponent extends ReportParameterComponent<string[]> implements OnInit, OnChanges {
  addLabel: string = '';
  labels$: Observable<string[]> = of([]);

  constructor(private supportService: SupportService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("changes", changes);
  }

  ngOnInit(): void {
    this.labels$ = combineLatest([
      this.supportService.listLabels(),
      of(this.ngModel),
    ]).pipe(
      map(([serviceLabels, selectedLabels]) => ({ serviceLabels, selectedLabels })),
      map(allLabels => allLabels.serviceLabels.filter(l => (allLabels.selectedLabels?.length || 0 > 0) || allLabels.selectedLabels!.indexOf(l) < 0))
    )
  }
}
