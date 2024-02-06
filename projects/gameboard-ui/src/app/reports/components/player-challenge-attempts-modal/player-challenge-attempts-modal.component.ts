import { BsModalRef } from 'ngx-bootstrap/modal';
import { ChallengeResult } from '@/api/board-models';
import { SimpleEntity } from '@/api/models';
import { ReportGame, ReportSponsor } from '@/reports/reports-models';
import { Component } from '@angular/core';

export interface PlayerChallengeAttempts extends Partial<PlayerChallengeAttemptsModalComponent> {
  subtitle: string;
  subtitleDetail?: string;
  player: {
    name: string,
    sponsor: ReportSponsor,
  },
  attempts: {
    challengeSpec: SimpleEntity,
    game: ReportGame,
    maxPossibleScore: number,
    result: ChallengeResult,
    score: number;
    scorePercentile?: number,
    startDate: Date
  }[]
}

@Component({
  selector: 'app-player-challenge-attempts-modal',
  templateUrl: './player-challenge-attempts-modal.component.html',
  styleUrls: ['./player-challenge-attempts-modal.component.scss']
})
export class PlayerChallengeAttemptsModalComponent {
  context!: PlayerChallengeAttempts;

  constructor(private modalRef: BsModalRef) { }

  handleModalClose() {
    this.modalRef.hide();
  }
}
