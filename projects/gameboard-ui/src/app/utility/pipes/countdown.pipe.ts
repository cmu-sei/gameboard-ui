// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countdown'
})
export class CountdownPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    const days = Math.floor(value / 1000 / 60 / 60 / 24);
    const hours = Math.floor(value / 1000 / 60 / 60 % 24);
    const minutes =  Math.floor(value / 1000 / 60 % 60);
    const seconds = Math.floor(value / 1000 % 60);
    let r: string[] = [];
    if (!!days) { // total days > 0
      r.push(days + "d");
    }
    if (!!days || !!hours) { // total hours > 0
      r.push(hours + "h");
    }
    if (!days && (!!hours || !!minutes)) { // days < 1 and total minutes > 0
      r.push(minutes + "m");
    } 
    if (!days && !hours && (minutes < 5) && (!!minutes || !!seconds)) { // total hours < 1, minutes < 5, total seconds > 0
      r.push(seconds + "s");
    }
    return r.join(" ");
  }

}
