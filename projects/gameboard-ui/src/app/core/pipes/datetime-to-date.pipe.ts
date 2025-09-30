// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'datetimeToDate',
    standalone: false
})
export class DatetimeToDatePipe implements PipeTransform {

  transform(value?: DateTime | null): Date | null | undefined {
    if (!value)
      return value;

    return value.toJSDate();
  }
}
