import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import { interval, map, Observable } from 'rxjs';

@Pipe({ name: 'epochMsToMsRemaining', standalone: true })
export class EpochMsToMsRemainingPipe implements PipeTransform {

  transform(value: number | null | undefined): Observable<number | null> | null {
    if (value === null || value === undefined || value < 0) {
      return null;
    }

    const dateTime = DateTime.fromMillis(value);

    return interval(1000).pipe(map(() => {
      const diffMs = dateTime.diffNow().toMillis();

      if (diffMs <= 0)
        return null;

      return diffMs;
    }));
  }
}
