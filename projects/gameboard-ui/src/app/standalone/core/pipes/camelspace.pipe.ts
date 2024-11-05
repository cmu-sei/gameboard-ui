// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'camelspace', standalone: true })
export class CamelspacePipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  }
}
