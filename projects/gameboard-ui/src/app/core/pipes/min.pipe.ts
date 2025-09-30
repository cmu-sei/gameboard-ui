// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'min',
    standalone: false
})
export class MinPipe implements PipeTransform {

  transform(value: number, other: number): number {
    return Math.min(value, other);
  }
}
