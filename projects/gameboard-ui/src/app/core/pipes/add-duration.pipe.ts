// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DateTime, DurationLike } from 'luxon';

@Pipe({
    name: 'addDuration',
    standalone: false
})
export class AddDurationPipe implements PipeTransform {

  transform(value: DateTime, duration: DurationLike): DateTime {
    if (!value)
      return value;

    return value.plus(duration);
  }
}
