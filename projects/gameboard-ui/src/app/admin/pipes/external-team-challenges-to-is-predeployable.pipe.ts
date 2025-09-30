// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { ExternalGameAdminChallenge } from '../components/external-game-admin/external-game-admin.component';

@Pipe({
    name: 'externalTeamChallengesToIsPredeployable',
    standalone: false
})
export class ExternalTeamChallengesToIsPredeployablePipe implements PipeTransform {

  transform(value: ExternalGameAdminChallenge[]): boolean {
    return value && value.some(c => !c.challengeCreated || !c.gamespaceDeployed);
  }
}
