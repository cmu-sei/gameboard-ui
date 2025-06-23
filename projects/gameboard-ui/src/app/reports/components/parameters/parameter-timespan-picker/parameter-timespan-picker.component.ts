import { Component, Input, OnInit } from '@angular/core';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '@/core/components/custom-input/custom-input.component';
import { TimespanQueryParamModel } from '@/core/models/timespan-query-param-model';
import { Subject, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
    selector: 'app-parameter-timespan-picker',
    templateUrl: './parameter-timespan-picker.component.html',
    styleUrls: ['./parameter-timespan-picker.component.scss'],
    providers: [createCustomInputControlValueAccessor(ParameterTimespanPickerComponent), UnsubscriberService],
    standalone: false
})
export class ParameterTimespanPickerComponent extends CustomInputComponent<TimespanQueryParamModel> implements OnInit {
  @Input() label = '';

  private setDays$ = new Subject<number | null>();

  constructor(private unsub: UnsubscriberService) { super(); }

  ngOnInit(): void {
    if (!this.ngModel) {
      throw new Error("Timespan picker requires a bound model.");
    }

    this.unsub.add(this.setDays$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(days => {
      this.ngModel!.days = days;
    }));
  }

  setDays($event: Event) {
    const result = parseInt(($event.target as HTMLInputElement).value);
    this.setDays$.next(result || null);
  }
}
