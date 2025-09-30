// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'countToTooltipClass',
    standalone: false
})
export class CountToTooltipClassPipe implements PipeTransform {

  transform(value?: number): string | null {
    if (value) {
      return "tooltipped-value";
    }

    return null;
  }
}
