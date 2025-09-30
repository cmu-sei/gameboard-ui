// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SimpleEntity } from '@/api/models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'simpleEntitiesToTooltip',
    standalone: false
})
export class SimpleEntitiesToTooltipPipe implements PipeTransform {

  transform(value: SimpleEntity[] | null | undefined): string {
    if (!value || value.length == 0)
      return "";

    return value.map(e => e.name).join(" | ");
  }
}
