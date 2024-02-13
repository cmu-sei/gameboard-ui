import { Sponsor } from '@/api/sponsor-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sponsor-edit-modal',
  templateUrl: './sponsor-edit-modal.component.html',
  styleUrls: ['./sponsor-edit-modal.component.scss']
})
export class SponsorEditModalComponent {
  protected editingSponsor?: Sponsor;
  protected onSave?: Function;

  constructor(private modalService: ModalConfirmService) { }

  protected handleSave() {
    if (this.onSave) {
      this.onSave();
    }

    this.modalService.hide();
  }

  protected handleModalClose() {
    this.modalService.hide();
  }
}
