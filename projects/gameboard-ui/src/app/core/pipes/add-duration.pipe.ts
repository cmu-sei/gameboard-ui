import { Pipe, PipeTransform } from '@angular/core';
import { DateTime, DurationLike } from 'luxon';

@Pipe({
    name: 'addDuration',
    standalone: false
})
export class AddDurationPipe implements PipeTransform {

  transform(value: DateTime, duration: DurationLike): DateTime {
    if (!value)
      return value;

    return value.plus(duration);
  }
}
