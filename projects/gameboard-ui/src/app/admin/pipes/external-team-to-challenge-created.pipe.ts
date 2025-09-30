// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { ExternalGameAdminTeam } from '@/admin/components/external-game-admin/external-game-admin.component';

@Pipe({
    name: 'externalTeamToChallengeCreated',
    standalone: false
})
export class ExternalTeamToChallengeCreatedPipe implements PipeTransform {

  transform(value: ExternalGameAdminTeam, specId: string): boolean {
    return value.challenges.some(c => c.specId == specId);
  }
}
