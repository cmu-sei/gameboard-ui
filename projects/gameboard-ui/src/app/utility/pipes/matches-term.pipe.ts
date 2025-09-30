// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'matchesterm',
    standalone: false
})
export class MatchesTermPipe implements PipeTransform {
  transform(challenge: any, term: string, ...properties: string[]): unknown {
    term = term.toLowerCase();
    if (!term.length)
      return true;
    for (let property of properties) {
      let val = challenge[property];
      if (!!val && val.toString().toLowerCase().includes(term))
        return true;
    }
    return false;
  }
}
