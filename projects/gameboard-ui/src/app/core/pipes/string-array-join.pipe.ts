// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringArrayJoin',
  standalone: true
})
export class StringArrayJoinPipe implements PipeTransform {

  transform(value: string[], delimiter: string = ", "): string {
    if (!value) {
      return "";
    }

    return value.join(delimiter);
  }
}
