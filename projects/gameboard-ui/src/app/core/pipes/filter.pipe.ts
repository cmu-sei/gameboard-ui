// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
    standalone: false
})
export class FilterPipe implements PipeTransform {

  transform<TSource, TProperty>(value: TSource[], property: keyof TSource, mustMatchValue: TProperty): TSource[] {
    if (!value || !value.length)
      return value;

    return value.filter(v => v[property] === mustMatchValue) || [];
  }
}
