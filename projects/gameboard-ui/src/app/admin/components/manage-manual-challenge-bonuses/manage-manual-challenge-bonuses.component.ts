import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { TeamChallengeScoreSummary } from '../../../api/scoring-models';
import { ScoringService } from '../../../services/scoring.service';

@Component({
  selector: 'app-manage-manual-challenge-bonuses',
  templateUrl: './manage-manual-challenge-bonuses.component.html',
  styleUrls: ['./manage-manual-challenge-bonuses.component.scss']
})
export class ManageManualChallengeBonusesComponent implements OnInit {
  @Input() challengeId!: string;

  summary?: TeamChallengeScoreSummary;

  constructor(private scoresService: ScoringService) { }

  ngOnInit(): void {
    this.scoresService.getTeamChallengeScore(this.challengeId)
      .pipe(first())
      .subscribe();
  }
}
