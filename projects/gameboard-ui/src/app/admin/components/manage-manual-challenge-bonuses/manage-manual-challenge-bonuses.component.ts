import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { SimpleEntity } from '@/api/models';
import { ScoringService } from '@/services/scoring/scoring.service';
import { CreateManualChallengeBonus, TeamGameScore } from '@/services/scoring/scoring.models';

@Component({
  selector: 'app-manage-manual-challenge-bonuses',
  templateUrl: './manage-manual-challenge-bonuses.component.html',
  styleUrls: ['./manage-manual-challenge-bonuses.component.scss']
})
export class ManageManualChallengeBonusesComponent implements OnInit {
  @Input() teamId!: string;

  summary?: TeamGameScore;
  startedChallenges: SimpleEntity[] = [];
  challengesStarted = 0;

  newChallengeBonusModel: CreateManualChallengeBonus = {
    description: '',
    challengeId: '',
    pointValue: 1
  };

  constructor(private scoresService: ScoringService) { }

  ngOnInit(): void {
    this.loadSummary(this.teamId);
  }

  private loadSummary(teamId: string) {
    this.scoresService.getTeamGameScore(teamId)
      .pipe(first())
      .subscribe(response => {
        this.summary = response.score;
        this.startedChallenges = this.summary.challenges
          .map(s => ({ id: s.id, name: s.name }));

        this.newChallengeBonusModel = {
          description: '',
          challengeId: response.score.challenges.length ? response.score.challenges[0].id : '',
          pointValue: 1
        };
      });
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
