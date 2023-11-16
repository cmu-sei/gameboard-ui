import { Pipe, PipeTransform } from '@angular/core';
import { ExternalGameAdminChallenge } from '../components/external-game-admin/external-game-admin.component';

@Pipe({
  name: 'externalTeamChallengesToIsPredeployable'
})
export class ExternalTeamChallengesToIsPredeployablePipe implements PipeTransform {

  transform(value: ExternalGameAdminChallenge[]): boolean {
    return value && value.some(c => !c.challengeCreated || !c.gamespaceDeployed);
  }
}
