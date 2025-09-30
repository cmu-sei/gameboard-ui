// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import { FriendlyDatesService } from '@/services/friendly-dates.service';

@Pipe({
    name: 'friendlyTime',
    standalone: false
})
export class FriendlyTimePipe implements PipeTransform {

  constructor(private friendlyDates: FriendlyDatesService) { }

  transform(value: DateTime | Date | null | undefined): string {
    return this.friendlyDates.toFriendlyTime(value);
  }
}
