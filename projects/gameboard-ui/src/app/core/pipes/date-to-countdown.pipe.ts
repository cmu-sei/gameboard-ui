import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable, interval, map } from 'rxjs';

@Pipe({ name: 'dateToCountdown' })
export class DateToCountdownPipe implements PipeTransform {

  transform(value: Date | string | undefined | null, showSecondsWhenRemainingLessThanMs?: number): Observable<string | null> | null {
    if (!value)
      return null;

    const date = DateTime.fromJSDate(new Date(value!));

    return interval(1000).pipe(
      map(_ => {
        let diffed = date
          .diffNow()
          .rescale()
          .set({ milliseconds: 0 });

        if (diffed.as("milliseconds") < 0)
          return null;

        if (showSecondsWhenRemainingLessThanMs && diffed.toMillis() > showSecondsWhenRemainingLessThanMs) {
          diffed = diffed.set({ seconds: 0 });
        } else {
          diffed = diffed.set({ seconds: Math.floor(diffed.get("seconds")) });
        }

        return diffed
          .rescale()
          .toHuman({ compactDisplay: "short", unitDisplay: "short" } as Intl.NumberFormatOptions);
      })
    );
  }
}

