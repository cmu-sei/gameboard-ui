import { Pipe, PipeTransform } from '@angular/core';
import { FriendlyDatesService } from '@/services/friendly-dates.service';

@Pipe({ name: 'friendlyTime' })
export class FriendlyTimePipe implements PipeTransform {

  constructor(private friendlyDates: FriendlyDatesService) { }

  transform(value?: Date): string {
    return this.friendlyDates.toFriendlyTime(value);
  }
}
