// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'epochMsToDateTime',
    standalone: false
})
export class EpochMsToDateTimePipe implements PipeTransform {
  transform(value: number | null | undefined): DateTime | null {
    if (value === null || value === undefined)
      return null;

    return DateTime.fromJSDate(new Date(value));
  }
}
