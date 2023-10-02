import { Sponsor } from '@/api/sponsor-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component } from '@angular/core';

export interface SponsorEditModalContext extends Partial<SponsorEditModalComponent> {
  editingSponsor: Sponsor;
  onSave: Function;
}

@Component({
  selector: 'app-sponsor-edit-modal',
  templateUrl: './sponsor-edit-modal.component.html',
  styleUrls: ['./sponsor-edit-modal.component.scss']
})
export class SponsorEditModalComponent {
  protected context!: SponsorEditModalContext;

  constructor(private modalService: ModalConfirmService) { }

  protected handleSave() {
    if (this.context.onSave) {
      this.context.onSave();
    }

    this.modalService.hide();
  }

  protected handleModalClose() {
    this.modalService.hide();
  }
}
