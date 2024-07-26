import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({ name: 'datetimeToDate' })
export class DatetimeToDatePipe implements PipeTransform {

  transform(value?: DateTime | null): Date | null | undefined {
    if (!value)
      return value;

    return value.toJSDate();
  }
}
