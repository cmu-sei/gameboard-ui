import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-manage-manual-challenge-bonuses-modal',
  templateUrl: './manage-manual-challenge-bonuses-modal.component.html',
  styleUrls: ['./manage-manual-challenge-bonuses-modal.component.scss']
})
export class ManageManualChallengeBonusesModalComponent {
  teamId!: string;
  playerName!: string;
  gameName!: string;

  constructor(private bsModalService: BsModalService) { }

  close() {
    this.bsModalService.hide();
  }
}
