// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'whitespace',
    standalone: false
})
export class WhitespacePipe implements PipeTransform {
  private static WHITESPACE_REGEX = /\r?\n+/g;

  transform(text: string): string[] {
    if (!text)
      return [];

    const retVal: string[] = [];
    const whitespaceSplits = text.split(WhitespacePipe.WHITESPACE_REGEX);

    for (const whitespaceSplit of whitespaceSplits) {
      if (!whitespaceSplit)
        continue;

      retVal.push(whitespaceSplit.trim());
    }

    return retVal;
  }
}
