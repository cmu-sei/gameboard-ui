// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Sponsor } from '@/api/sponsor-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component } from '@angular/core';

@Component({
    selector: 'app-sponsor-edit-modal',
    templateUrl: './sponsor-edit-modal.component.html',
    styleUrls: ['./sponsor-edit-modal.component.scss'],
    standalone: false
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
