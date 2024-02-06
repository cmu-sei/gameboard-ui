import { TeamScoreQueryResponse } from '@/services/scoring/scoring.models';
import { ScoringService } from '@/services/scoring/scoring.service';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { firstValueFrom } from 'rxjs';

export interface ScoreboardTeamDetailModalContext extends Partial<ScoreboardTeamDetailModalComponent> {
  teamId: string;
}

@Component({
  selector: 'app-scoreboard-team-detail-modal',
  templateUrl: './scoreboard-team-detail-modal.component.html',
  styleUrls: ['./scoreboard-team-detail-modal.component.scss']
})
export class ScoreboardTeamDetailModalComponent implements OnInit {
  teamId?: string;

  protected context?: TeamScoreQueryResponse;
  protected hasBonuses = false;
  protected hasManualChallengeBonuses = false;
  protected hasManualTeamBonuses = false;
  protected challengeManualBonusTotal = 0;
  protected teamManualBonusTotal = 0;
  protected isTeam = false;

  constructor(
    private scoring: ScoringService,
    private modalRef: BsModalRef) { }

  async ngOnInit(): Promise<void> {
    if (!this.teamId)
      throw new Error("Couldn't retrieve the score: unknown team.");

    await this.loadTeam(this.teamId);
  }

  private async loadTeam(teamId: string) {
    this.context = await firstValueFrom(this.scoring.getTeamScore(teamId));
    if (!this.context) {
      throw new Error(`Couldn't retrieve a score for team ${this.teamId}`);
    }

    // affects how the score breakdown is rendered
    this.hasBonuses = !!this.context.score.overallScore.bonusScore;
    this.hasManualChallengeBonuses = !!this.context.score.challenges.filter(c => !!c.manualBonuses.length).length;
    this.hasManualTeamBonuses = !!this.context.score.overallScore.manualBonusScore;
    this.isTeam = this.context.score.players.length > 1;

    // the scoring endpoint currently doesn't provide the total of challenge manual bonuses 
    // vs team manual bonuses
    if (this.hasManualTeamBonuses) {
      this.challengeManualBonusTotal = this
        .context
        .score
        .challenges
        .map(c => c.score.manualBonusScore)
        .reduce((accumulator, nextValue) => accumulator + nextValue);

      this.teamManualBonusTotal = this
        .context
        .score
        .manualBonuses
        .map(b => b.pointValue)
        .reduce((accumulator, nextValue) => accumulator + nextValue);

    }
  }

  protected handleModalClose() {
    this.modalRef.hide();
  }
}
