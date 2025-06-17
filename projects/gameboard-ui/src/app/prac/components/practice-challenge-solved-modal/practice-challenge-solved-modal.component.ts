import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserActiveChallenge } from '@/api/challenges.models';
import { PlayerMode } from '@/api/player-models';
import { PracticeService } from '@/services/practice.service';
import { RouterService } from '@/services/router.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { GameService } from '@/api/game.service';

export interface PracticeChallengeSolvedModalContext {
  challenge: UserActiveChallenge;
}

@Component({
    selector: 'app-practice-challenge-solved-modal',
    templateUrl: './practice-challenge-solved-modal.component.html',
    styleUrls: ['./practice-challenge-solved-modal.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
})
export class PracticeChallengeSolvedModalComponent implements OnInit {
  context?: PracticeChallengeSolvedModalContext;
  protected certificateUrl?: string;
  protected feedbackTemplateId?: string;
  protected isCertificateConfigured = false;

  constructor(
    private gameService: GameService,
    private practiceService: PracticeService,
    private routerService: RouterService,
    private unsub: UnsubscriberService,
    private modalRef: BsModalRef) { }

  async ngOnInit(): Promise<void> {
    if (!this.context) {
      throw new Error("Can't resolve the context for the PracticeChallengeSolvedModalComponent.");
    }

    // we need the game to check its challenges feedback template and its cert template
    const game = await firstValueFrom(this.gameService.retrieve(this.context.challenge.game.id));

    this.feedbackTemplateId = game.challengesFeedbackTemplateId;
    const practiceSettings = await firstValueFrom(this.practiceService.getSettings());
    this.isCertificateConfigured = !!game.practiceCertificateTemplateId || !!practiceSettings.certificateTemplateId;
    this.certificateUrl = this.routerService.getCertificatePrintableUrl(PlayerMode.practice, this.context.challenge.spec.id);

    // wire up event handler for background-click dismiss
    if (this.modalRef.onHidden) {
      this.unsub.add(
        this.modalRef.onHidden.subscribe(() => this.routerService.toPracticeArea())
      );
    }
  }

  handleModalClose() {
    this.modalRef.hide();
    this.routerService.toPracticeArea();
  }
}
