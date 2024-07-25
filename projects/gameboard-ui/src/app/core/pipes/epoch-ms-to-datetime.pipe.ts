import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({ name: 'epochMsToDateTime' })
export class EpochMsToDateTimePipe implements PipeTransform {
  transform(value: number | null | undefined): DateTime | null {
    if (value === null || value === undefined)
      return null;

    return DateTime.fromJSDate(new Date(value));
  }
}
