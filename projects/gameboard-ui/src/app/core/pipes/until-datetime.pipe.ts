import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'untilDateTime'
})
export class UntilDateTimePipe implements PipeTransform {

  transform(value: DateTime | null): string | null {
    if (!value)
      return null;

    return value
      .diffNow()
      .shiftTo("hours", "minutes")
      .toHuman({ listStyle: "narrow", maximumFractionDigits: 0 });
  }
}
