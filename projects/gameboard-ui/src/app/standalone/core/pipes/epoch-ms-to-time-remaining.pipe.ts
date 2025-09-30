// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import { interval, map, Observable, of } from 'rxjs';

@Pipe({
  name: 'epochMsToTimeRemainingString',
  standalone: true
})
export class EpochMsToTimeRemainingStringPipe implements PipeTransform {
  transform(value: number | null | undefined): Observable<string> | null {
    if (value === null || value === undefined || value < 0) {
      return of("--");
    }

    const dateTime = DateTime.fromMillis(value);

    return interval(1000).pipe(map(() => {
      const diff = dateTime.diffNow();

      if (dateTime.toMillis() <= 0)
        return "--";

      if (diff.as("hours") > 1)
        return diff
          .shiftTo("hours", "minutes")
          .toHuman({ maximumFractionDigits: 0 });

      return diff
        .shiftTo("minutes", "seconds")
        .toFormat("mm:ss");
    }));
  }
}
