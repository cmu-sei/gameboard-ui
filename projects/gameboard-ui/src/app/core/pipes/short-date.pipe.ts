// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { FriendlyDatesService } from '@/services/friendly-dates.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'shortdate',
    standalone: false
})
export class ShortDatePipe implements PipeTransform {
  constructor(private friendlyDates: FriendlyDatesService) { }

  transform(date: any): string {
    return this.friendlyDates.toFriendlyDate(date);
  }
}
