// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'toTemplateContext',
    standalone: false
})
export class ToTemplateContextPipe implements PipeTransform {

  transform(value: unknown): Object | null {
    const ctx = (!value ? null : value) as Object;

    return {
      $implicit: ctx,
      context: ctx
    };
  }
}
