import { SimpleEntity } from '@/api/models';
import { IModalReady } from '@/core/components/modal/modal.models';
import { GameScoreTeam } from '@/services/scoring/scoring.models';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface ScoreboardTeamDetailModalContext extends Partial<ScoreboardTeamDetailModalComponent> {
  game: SimpleEntity;
  teamData: GameScoreTeam;
}

@Component({
  selector: 'app-scoreboard-team-detail-modal',
  templateUrl: './scoreboard-team-detail-modal.component.html',
  styleUrls: ['./scoreboard-team-detail-modal.component.scss']
})
export class ScoreboardTeamDetailModalComponent implements IModalReady<ScoreboardTeamDetailModalContext>, OnInit {
  context!: ScoreboardTeamDetailModalContext;
  protected hasBonuses = false;
  protected hasManualChallengeBonuses = false;
  protected hasManualTeamBonuses = false;
  protected challengeManualBonusTotal = 0;
  protected teamManualBonusTotal = 0;
  protected isTeam = false;

  constructor(private modalRef: BsModalRef) { }

  ngOnInit(): void {
    if (!this.context) {
      throw new Error("Can't use ScoreboardTeamDetailModalComponent with a falsey context");
    }

    // affects how the score breakdown is rendered
    this.hasBonuses = !!this.context.teamData.overallScore.bonusScore;
    this.hasManualChallengeBonuses = !!this.context.teamData.challenges.filter(c => !!c.manualBonuses.length).length;
    this.hasManualTeamBonuses = !!this.context.teamData.overallScore.manualBonusScore;
    this.isTeam = this.context.teamData.players.length > 1;

    // the scoring endpoint currently doesn't provide the total of challenge manual bonuses 
    // vs team manual bonuses
    if (this.hasManualTeamBonuses) {
      this.challengeManualBonusTotal = this
        .context
        .teamData
        .challenges
        .map(c => c.score.manualBonusScore)
        .reduce((accumulator, nextValue) => accumulator + nextValue);

      this.teamManualBonusTotal = this
        .context
        .teamData
        .manualBonuses
        .map(b => b.pointValue)
        .reduce((accumulator, nextValue) => accumulator + nextValue);
    }
  }

  protected handleModalClose() {
    this.modalRef.hide();
  }
}
