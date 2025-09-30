// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isNumber', standalone: true })
export class IsNumberPipe implements PipeTransform {

  transform(value: any): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    const tryIt = +value;
    return isNaN(tryIt) ? false : true;
  }
}
