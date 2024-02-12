import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable, interval, map } from 'rxjs';

@Pipe({ name: 'dateToCountdown' })
export class DateToCountdownPipe implements PipeTransform {

  transform(value: Date | string | undefined | null): Observable<string | null> | null {
    if (!value)
      return null;

    const date = DateTime.fromJSDate(new Date(value!));

    return interval(1000).pipe(
      map(_ => {
        const diffed = date.diffNow().rescale();
        diffed.normalize();

        return diffed
          .set({ milliseconds: 0 })
          .set({ seconds: Math.floor(diffed.get("seconds")) })
          .rescale();
      }),
      map(duration => {
        if (duration.as("milliseconds") < 0)
          return null;

        return duration.toHuman({ listStyle: "narrow", unitDisplay: "short" } as Intl.NumberFormatOptions);
      })
    );
  }
}

