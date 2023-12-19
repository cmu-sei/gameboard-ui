import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BoardPlayer } from '@/api/board-models';
import { BoardService } from '@/api/board.service';
import { LocalActiveChallenge } from '@/api/challenges.models';
import { PlayerMode } from '@/api/player-models';
import { MiniBoardSpec } from '@/core/components/feedback-form/feedback-form.component';
import { PracticeService } from '@/services/practice.service';
import { RouterService } from '@/services/router.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface PracticeChallengeSolvedModalContext {
  challenge: LocalActiveChallenge;
}

interface LegacyFeedbackFormContext {
  boardPlayer?: BoardPlayer;
  boardSpec?: MiniBoardSpec;
}

@Component({
  selector: 'app-practice-challenge-solved-modal',
  templateUrl: './practice-challenge-solved-modal.component.html',
  styleUrls: ['./practice-challenge-solved-modal.component.scss'],
  providers: [UnsubscriberService]
})
export class PracticeChallengeSolvedModalComponent implements OnInit {
  protected context?: PracticeChallengeSolvedModalContext;
  protected certificateUrl?: string;
  protected isCertificateConfigured = false;
  protected feedbackFormContext?: LegacyFeedbackFormContext = undefined;

  constructor(
    private boardService: BoardService,
    private practiceService: PracticeService,
    private routerService: RouterService,
    private unsub: UnsubscriberService,
    private modalRef: BsModalRef) { }

  async ngOnInit(): Promise<void> {
    if (!this.context) {
      throw new Error("Can't resolve the context for the PracticeChallengeSolvedModalComponent.");
    }

    const practiceSettings = await firstValueFrom(this.practiceService.getSettings());
    this.isCertificateConfigured = !!practiceSettings.certificateHtmlTemplate;
    this.certificateUrl = this.routerService.getCertificatePrintableUrl(PlayerMode.practice, this.context.challenge.spec.id);

    // load feedback form data
    this.feedbackFormContext = await this.loadFeedbackFormContext(this.context.challenge);

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

  private async loadFeedbackFormContext(challenge: LocalActiveChallenge): Promise<LegacyFeedbackFormContext | undefined> {
    const player = await firstValueFrom(this.boardService.load(challenge.player.id));

    if (!player.game.feedbackTemplate?.challenge?.length)
      return undefined;

    return {
      boardPlayer: player,
      boardSpec: {
        id: challenge.spec.id,
        instance: {
          id: challenge.challengeDeployment.challengeId,
          state: { isActive: challenge.challengeDeployment.isDeployed },
        }
      }
    };
  }
}
