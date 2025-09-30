// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class ApiDateTimeService {
  toDateTime(input?: string | Date): DateTime | null {
    if (!input || input === "undefined") return null;

    // as of now, the API returns date objects as string (blargh)
    const parsedDateTime = DateTime.fromJSDate(new Date(input));

    // also, it stores null dates as 1/1/01 (which gets converted to a time on 12/31/0000 because timezones),
    // so account for that too
    if (parsedDateTime.year == 0)
      return null;

    return parsedDateTime;
  }
}
