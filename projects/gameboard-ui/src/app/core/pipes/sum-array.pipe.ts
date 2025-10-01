// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sumArray',
    standalone: false
})
export class SumArrayPipe implements PipeTransform {

  transform(value: number[]): number {
    if (!value?.length)
      return 0;

    return value.reduce((accumulator, nextValue) => {
      return accumulator + nextValue;
    });
  }
}
