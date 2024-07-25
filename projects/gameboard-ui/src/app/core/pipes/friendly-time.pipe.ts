import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import { FriendlyDatesService } from '@/services/friendly-dates.service';

@Pipe({ name: 'friendlyTime' })
export class FriendlyTimePipe implements PipeTransform {

  constructor(private friendlyDates: FriendlyDatesService) { }

  transform(value: DateTime | Date | null | undefined): string {
    return this.friendlyDates.toFriendlyTime(value);
  }
}
