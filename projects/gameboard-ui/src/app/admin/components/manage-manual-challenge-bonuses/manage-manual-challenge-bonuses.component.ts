import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { SimpleEntity } from '@/api/models';
import { ScoringService } from '@/services/scoring/scoring.service';
import { CreateManualChallengeBonus, TeamGameScore, TeamGameScoreQueryResponse } from '@/services/scoring/scoring.models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-manage-manual-challenge-bonuses',
  templateUrl: './manage-manual-challenge-bonuses.component.html',
  styleUrls: ['./manage-manual-challenge-bonuses.component.scss']
})
export class ManageManualChallengeBonusesComponent implements OnInit {
  @Input() teamId!: string;

  protected hasStartedChallenges = false;
  protected teamScoreData?: TeamGameScoreQueryResponse;

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
    const scoreData = await firstValueFrom(this.scoresService.getTeamGameScore(teamId));
    this.teamScoreData = scoreData;
    this.hasStartedChallenges = scoreData.score.challenges.length > 0;
    this.newChallengeBonusModel = {
      challengeId: scoreData.score.challenges.length ? scoreData.score.challenges[0].id : "",
      description: "",
      pointValue: 1
    };
  }

  handleDelete(manualbonusId: string) {
    this.scoresService.deleteManualBonus(manualbonusId)
      .pipe(first())
      .subscribe(() => this.loadSummary(this.teamId));
  }

  onSubmit() {
    this.scoresService
      .createManualChallengeBonus(this.newChallengeBonusModel)
      .pipe(first())
      .subscribe(_ => {
        this.loadSummary(this.teamId);
      });
  }
}
