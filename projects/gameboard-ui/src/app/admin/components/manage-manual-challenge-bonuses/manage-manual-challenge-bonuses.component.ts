// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { ScoringService } from '@/services/scoring/scoring.service';
import { CreateManualChallengeBonus, TeamScoreQueryResponse } from '@/services/scoring/scoring.models';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-manage-manual-challenge-bonuses',
    templateUrl: './manage-manual-challenge-bonuses.component.html',
    styleUrls: ['./manage-manual-challenge-bonuses.component.scss'],
    standalone: false
})
export class ManageManualChallengeBonusesComponent implements OnInit {
  @Input() teamId!: string;

  protected hasStartedChallenges = false;
  protected teamScoreData?: TeamScoreQueryResponse;

  newChallengeBonusModel: CreateManualChallengeBonus = {
    description: '',
    challengeId: '',
    pointValue: 1
  };

  constructor(private scoresService: ScoringService) { }

  async ngOnInit(): Promise<void> {
    await this.loadSummary(this.teamId);
  }

  private async loadSummary(teamId: string) {
    const scoreData = await firstValueFrom(this.scoresService.getTeamScore(teamId));
    this.teamScoreData = scoreData;
    this.hasStartedChallenges = scoreData.score.challenges.length > 0;
    this.newChallengeBonusModel = {
      challengeId: "",
      description: "",
      pointValue: 1
    };
  }

  async handleDelete(manualBonusId: string) {
    await firstValueFrom(this.scoresService.deleteManualBonus(manualBonusId));
    await this.loadSummary(this.teamId);
  }

  async onSubmit() {
    if (this.newChallengeBonusModel.challengeId) {
      await firstValueFrom(this.scoresService.createManualChallengeBonus(this.newChallengeBonusModel));
    }
    else {
      await firstValueFrom(this.scoresService.createManualTeamBonus({
        ...this.newChallengeBonusModel,
        teamId: this.teamId
      }));
    }
    await this.loadSummary(this.teamId);
  }
}
