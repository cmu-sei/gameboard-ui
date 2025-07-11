import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'dateTimeIsPast',
    standalone: false
})
export class DateTimeIsPastPipe implements PipeTransform {
  transform(value: DateTime | null): boolean {
    if (!value)
      return false;

    return value.diffNow().toMillis() < 0;
  }
}
