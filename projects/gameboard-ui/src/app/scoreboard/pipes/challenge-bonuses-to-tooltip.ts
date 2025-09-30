// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'challengeBonusesToTooltip',
    standalone: false
})
export class ChallengeBonusesToTooltip implements PipeTransform {

  transform(value: { description: string }[]): string {
    if (!value || !value.length)
      return "";

    return value[0].description;
  }
}
