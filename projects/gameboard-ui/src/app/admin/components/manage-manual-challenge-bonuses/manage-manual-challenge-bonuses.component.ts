import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { SimpleEntity } from '../../../api/models';
import { CreateManualChallengeBonus, TeamGameScoreSummary } from '../../../api/scoring-models';
import { ScoringService } from '../../../services/scoring/scoring.service';

@Component({
  selector: 'app-manage-manual-challenge-bonuses',
  templateUrl: './manage-manual-challenge-bonuses.component.html',
  styleUrls: ['./manage-manual-challenge-bonuses.component.scss']
})
export class ManageManualChallengeBonusesComponent implements OnInit {
  @Input() teamId!: string;

  summary?: TeamGameScoreSummary;
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
      .subscribe(summary => {
        this.summary = summary;
        this.startedChallenges = this.summary.challengeScoreSummaries.filter(s => !!s.challenge).map(s => s.challenge);

        this.newChallengeBonusModel = {
          description: '',
          challengeId: summary.challengeScoreSummaries.length ? summary.challengeScoreSummaries[0].challenge.id : '',
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
