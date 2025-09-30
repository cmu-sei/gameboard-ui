// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'untilDateTime',
    standalone: false
})
export class UntilDateTimePipe implements PipeTransform {

  transform(value: DateTime | null): string | null {
    if (!value)
      return null;

    return value
      .diffNow()
      .shiftTo("hours", "minutes")
      .toHuman({ listStyle: "narrow", maximumFractionDigits: 0 });
  }
}
