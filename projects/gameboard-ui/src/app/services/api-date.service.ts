import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class ApiDateService {
  toDateTime(input?: string): DateTime | null {
    if (!input) return null;

    // as of now, the API returns date objects as string (blargh)
    const parsedDateTime = DateTime.fromISO(input);

    // also, it stores null dates as 1/1/01, so account for that too
    if (parsedDateTime.year == 1)
      return null;

    return parsedDateTime;
  }
}
