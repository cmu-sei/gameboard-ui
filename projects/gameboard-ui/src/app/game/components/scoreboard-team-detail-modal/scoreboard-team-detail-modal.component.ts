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
  protected isTeam = false;
  constructor(private modalRef: BsModalRef) { }

  ngOnInit(): void {
    if (!this.context) {
      throw new Error("Can't use ScoreboardTeamDetailModalComponent with a falsey context");
    }

    // affects how the score breakdown is rendered
    this.hasBonuses = !!(this.context.teamData.overallScore.bonusScore || this.context.teamData.overallScore.manualBonusScore);
    this.isTeam = this.context.teamData.players.length > 1;
  }

  protected handleModalClose() {
    this.modalRef.hide();
  }
}
