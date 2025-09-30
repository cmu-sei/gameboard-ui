// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'dateToDateTime',
    standalone: false
})
export class DateToDatetimePipe implements PipeTransform {
  transform(value: Date): DateTime | null {
    if (!value)
      return value;

    const asDate = new Date(value);

    // using the date constructor to guard against stringified dates coming in
    return asDate.getFullYear() <= 1 ? null : DateTime.fromJSDate(asDate);
  }
}
