// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'hasPendingName',
    standalone: false
})
export class HasPendingNamePipe implements PipeTransform {
  transform(namedThing: { name: string, approvedName: string, nameStatus: string }): boolean {
    return (!!namedThing.name && namedThing.name !== namedThing.approvedName);
  }
}
