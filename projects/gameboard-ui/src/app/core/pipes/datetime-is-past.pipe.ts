import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({ name: 'dateTimeIsPast' })
export class DateTimeIsPastPipe implements PipeTransform {
  transform(value: DateTime): boolean {
    return value.diffNow().toMillis() < 0;
  }
}
