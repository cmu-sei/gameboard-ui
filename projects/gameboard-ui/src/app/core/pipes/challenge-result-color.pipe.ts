// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ChallengeResult } from '@/api/board-models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'challengeResultColor',
    standalone: false
})
export class ChallengeResultColorPipe implements PipeTransform {

  transform(value: ChallengeResult): string {
    if (!value || value == "none") {
      return "colorblind-danger";
    }

    if (value == "success") {
      return "text-success";
    }

    return "text-info";
  }
}
