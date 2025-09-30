// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { ExternalGameAdminChallenge } from '../components/external-game-admin/external-game-admin.component';

@Pipe({
    name: 'externalSpecIdToChallenge',
    standalone: false
})
export class ExternalSpecIdToChallengePipe implements PipeTransform {

  transform(value: string, challenges: ExternalGameAdminChallenge[]): ExternalGameAdminChallenge | null {
    if (!value || !challenges || !challenges.length) {
      throw new Error("Can't use ExternalSpecIdToChallengePipe without expected arguments.");
    }

    return challenges.find(c => c.specId == value) || null;
  }
}
