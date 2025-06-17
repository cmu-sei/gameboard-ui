import { ChallengeResult } from '@/api/board-models';
import { TeamScoreChallenge } from '@/services/scoring/scoring.models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'teamChallengeScoresToChallengeResultTypeCount',
    standalone: false
})
export class TeamChallengeScoresToChallengeResultTypeCountPipe implements PipeTransform {

  transform(value: TeamScoreChallenge[], resultType: ChallengeResult): number | null {
    if (!value) {
      return null;
    }

    return value.filter(challenge => challenge.result == resultType).length;
  }
}
