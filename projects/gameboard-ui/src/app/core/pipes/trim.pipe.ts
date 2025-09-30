// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'trim',
    standalone: false
})
export class TrimPipe implements PipeTransform {

  transform(value: string = "", trimString: string = "", trimTarget: "start" | "end" | "both" = "both"): string {

    if (!value)
      return value;

    if (!trimString) {
      throw new Error("Can't use the Trim pipe without a trimString.");
    }

    let result = value;

    if (trimTarget === "start" || trimTarget === "both") {
      result = result.startsWith(trimTarget) ? result.substring(trimTarget.length) : result;
    }

    if (trimTarget === "end" || trimTarget === "both") {
      result = result.endsWith(trimString) ? result.substring(0, result.length - trimString.length) : result;
    }

    return result;
  }
}
