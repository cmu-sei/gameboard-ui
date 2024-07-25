import { FriendlyDatesService } from '@/services/friendly-dates.service';
import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({ name: 'friendlyDateAndTime' })
export class FriendlyDateAndTimePipe implements PipeTransform {
  constructor(private friendlyDates: FriendlyDatesService) { }

  transform(value?: Date | DateTime | null): string | null {
    if (!value)
      return null;

    return this.friendlyDates.toFriendlyDateAndTime(value);
  }
}
