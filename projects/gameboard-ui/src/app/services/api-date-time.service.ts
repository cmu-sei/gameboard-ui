import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class ApiDateTimeService {
  toDateTime(input?: string): DateTime | null {
    if (!input || input === "undefine") return null;

    // as of now, the API returns date objects as string (blargh)
    const parsedDateTime = DateTime.fromISO(input);

    // also, it stores null dates as 1/1/01 (which gets converted to a time on 12/31/0000 because timezones),
    // so account for that too
    if (parsedDateTime.year == 0)
      return null;

    return parsedDateTime;
  }
}
