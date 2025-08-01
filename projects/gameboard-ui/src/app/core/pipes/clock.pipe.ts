// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'clock',
    standalone: false
})
export class ClockPipe implements PipeTransform {

  transform(value?: number): string | null {
    if (!value)
      return null;

    value = value / 1000;
    const h = Math.floor(value / 3600);
    const m = Math.floor((value - (h * 3600)) / 60);
    const s = Math.floor(value - (h * 3600) - (m * 60));

    return `${('' + h).padStart(2, '0')}:${('' + m).padStart(2, '0')}:${('' + s).padStart(2, '0')}`;
  }
}
