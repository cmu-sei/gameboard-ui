// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { hasProperty } from '@/../tools/functions';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'arrayProperty',
    standalone: false
})
export class ArrayPropertyPipe<T extends {}, U> implements PipeTransform {
  transform(value: T, propertyName: string): U[] | null {
    if (!value || !Array.isArray(value))
      return null;

    const retVal: U[] = [];
    for (const item of value) {
      if (hasProperty(item, propertyName))
        retVal.push((item as any)[propertyName]);
    }

    return retVal;
  }
}
