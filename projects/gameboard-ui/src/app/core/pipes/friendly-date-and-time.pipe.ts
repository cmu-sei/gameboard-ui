// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { FriendlyDatesService } from '@/services/friendly-dates.service';
import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'friendlyDateAndTime',
    standalone: false
})
export class FriendlyDateAndTimePipe implements PipeTransform {
  constructor(private friendlyDates: FriendlyDatesService) { }

  transform(value?: Date | DateTime | null): string | null {
    if (!value)
      return null;

    return this.friendlyDates.toFriendlyDateAndTime(value);
  }
}
