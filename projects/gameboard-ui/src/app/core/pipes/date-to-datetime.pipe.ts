import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({ name: 'dateToDateTime' })
export class DateToDatetimePipe implements PipeTransform {
  transform(value: Date): DateTime {
    if (!value)
      return value;

    // using the date constructor to guard against stringified dates coming in
    return DateTime.fromJSDate(new Date(value));
  }
}
