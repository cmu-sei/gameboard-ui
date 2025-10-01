// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numbersToPercentage',
    standalone: false
})
export class NumbersToPercentage implements PipeTransform {

  transform(count: number, total: number): number {
    if (total <= 0)
      return 0;

    const rawPct = (count * 1.0) / total; // forces decimal division
    return rawPct * 100;
  }
}
