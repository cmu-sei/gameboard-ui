// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'datetimeIsFuture',
    standalone: false
})
export class DateTimeIsFuturePipe implements PipeTransform {
  transform(value: DateTime | null): boolean {
    if (!value)
      return false;

    return value.diffNow().toMillis() > 0;
  }
}
