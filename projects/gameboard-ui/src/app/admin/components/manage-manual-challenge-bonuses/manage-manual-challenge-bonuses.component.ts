import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { CreateManualChallengeBonus, TeamGameScoreSummary } from '../../../api/scoring-models';
import { ScoringService } from '../../../services/scoring.service';

@Component({
  selector: 'app-manage-manual-challenge-bonuses',
  templateUrl: './manage-manual-challenge-bonuses.component.html',
  styleUrls: ['./manage-manual-challenge-bonuses.component.scss']
})
export class ManageManualChallengeBonusesComponent implements OnInit {
  @Input() teamId!: string;

  summary?: TeamGameScoreSummary;
  newChallengeBonusModel: CreateManualChallengeBonus = {
    description: '',
    challengeId: '',
    pointValue: 1
  }

  constructor(private scoresService: ScoringService) { }

  ngOnInit(): void {
    this.loadSummary(this.teamId);
  }

  private loadSummary(teamId: string) {
    this.scoresService.getTeamGameScore(teamId)
      .pipe(first())
      .subscribe(summary => {
        this.summary = summary;
        this.newChallengeBonusModel = {
          description: '',
          challengeId: summary.challengeScoreSummaries.length ? summary.challengeScoreSummaries[0].challenge.id : '',
          pointValue: 1
        }
      });
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
