import { Component, OnInit } from '@angular/core';
import { SupportService } from 'projects/gameboard-ui/src/app/api/support.service';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { Observable, combineLatest, map, of } from 'rxjs';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ColoredTextChipEvent } from '@/core/components/colored-text-chip/colored-text-chip.component';

@Component({
  selector: 'app-parameter-ticket-labels',
  templateUrl: './parameter-ticket-labels.component.html',
  styleUrls: ['./parameter-ticket-labels.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterTicketLabelsComponent)]
})
export class ParameterTicketLabelsComponent extends ReportParameterComponent<string[]> implements OnInit {
  addLabel: string = '';
  labels$: Observable<string[]> = of([]);

  constructor(private supportService: SupportService) {
    super();
  }

  ngOnInit(): void {
    this.labels$ = combineLatest([
      this.supportService.listLabels(),
      of(this.ngModel),
    ]).pipe(
      map(([serviceLabels, selectedLabels]) => ({ serviceLabels, selectedLabels })),
      map(allLabels => allLabels.serviceLabels.filter(l => (allLabels.selectedLabels?.length || 0 > 0) || allLabels.selectedLabels!.indexOf(l) < 0))
    );
  }

  override getDefaultValue(): string[] | undefined {
    return [];
  }

  handleChipRemoveClick(event: ColoredTextChipEvent) {
    if (this.ngModel) {
      // todo: why though
      // this.ngModel = this.ngModel.filter(l => l !== event.text);

      const removeIndex = this.ngModel.indexOf(event.text);
      if (removeIndex > -1) {
        this.ngModel.splice(removeIndex, 1);
      }
    }
  }

  handleSelect(match: TypeaheadMatch) {
    this.ngModel?.push(match.value);
    this.addLabel = '';
  }
}
