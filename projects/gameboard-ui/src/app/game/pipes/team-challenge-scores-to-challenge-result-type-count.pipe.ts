// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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
