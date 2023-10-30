import { LocalActiveChallenge } from '@/api/challenges.models';
import { PlayerMode } from '@/api/player-models';
import { PracticeService } from '@/services/practice.service';
import { RouterService } from '@/services/router.service';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { firstValueFrom } from 'rxjs';

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
  protected isCertificateConfigured = false;

  constructor(
    private practiceService: PracticeService,
    private routerService: RouterService,
    private modalRef: BsModalRef) { }

  async ngOnInit(): Promise<void> {
    if (!this.context) {
      throw new Error("Can't resolve the context for the PracticeChallengeSolvedModalComponent.");
    }

    const practiceSettings = await firstValueFrom(this.practiceService.getSettings());
    this.isCertificateConfigured = !!practiceSettings.certificateHtmlTemplate;
    this.certificateUrl = this.routerService.getCertificatePrintableUrl(PlayerMode.practice, this.context.challenge.spec.id);
  }

  handleModalClose() {
    this.modalRef.hide();
    this.routerService.toPracticeArea();
  }
}
