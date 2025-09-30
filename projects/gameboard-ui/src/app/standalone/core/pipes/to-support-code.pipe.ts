// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toSupportCode', standalone: true })
export class ToSupportCodePipe implements PipeTransform {
  transform(value: { id: string, tag?: string }): string {
    const tag = value?.tag ? ` ${value.tag}` : "";
    const idLength = Math.min(value.id.length, 8);
    return `${value.id.slice(0, idLength)}${tag}`;
  }
}
