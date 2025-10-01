// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'toggleClass',
    standalone: false
})
export class ToggleClassPipe implements PipeTransform {

  transform(value: boolean, classTrue: string, classFalse: string, otherClasses: string): string {
    return `${otherClasses} ${value ? classTrue : classFalse}`;
  }
}
