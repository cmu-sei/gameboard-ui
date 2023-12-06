import { Pipe, PipeTransform } from '@angular/core';
import { ExternalGameAdminTeam } from '@/admin/components/external-game-admin/external-game-admin.component';

@Pipe({ name: 'externalTeamToChallengeCreated' })
export class ExternalTeamToChallengeCreatedPipe implements PipeTransform {

  transform(value: ExternalGameAdminTeam, specId: string): boolean {
    return value.challenges.some(c => c.specId == specId);
  }
}
