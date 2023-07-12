import { FriendlyDatesService } from '@/services/friendly-dates.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'friendlyDateAndTime' })
export class FriendlyDateAndTimePipe implements PipeTransform {
  constructor(private friendlyDates: FriendlyDatesService) { }

  transform(value?: Date): unknown {
    return this.friendlyDates.toFriendlyDateAndTime(value);
  }
}
