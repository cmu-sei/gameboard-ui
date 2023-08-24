import { LocalActiveChallenge } from '@/api/challenges.models';
import { PlayerMode } from '@/api/player-models';
import { RouterService } from '@/services/router.service';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface PracticeChallengeSolvedModalContext {
  challenge: LocalActiveChallenge;
}

@Component({
  selector: 'app-practice-challenge-solved-modal',
  templateUrl: './practice-challenge-solved-modal.component.html',
  styleUrls: ['./practice-challenge-solved-modal.component.scss']
})
export class PracticeChallengeSolvedModalComponent implements OnInit {
  protected context?: PracticeChallengeSolvedModalContext;
  protected certificateUrl?: string;

  constructor(
    private routerService: RouterService,
    private modalRef: BsModalRef) { }

  ngOnInit(): void {
    if (!this.context) {
      throw new Error("Can't resolve the context for the PracticeChallengeSolvedModalComponent.");
    }

    this.certificateUrl = this.routerService.getCertificatePrintableUrl(PlayerMode.practice, this.context.challenge.spec.id);
  }

  handleModalClose() {
    this.modalRef.hide();
    this.routerService.toPracticeArea();
  }
}
