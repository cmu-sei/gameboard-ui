// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { Sponsor } from '@/api/sponsor-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SponsorEditModalComponent } from '../sponsor-edit-modal/sponsor-edit-modal.component';

@Component({
    selector: 'app-sponsor-admin-entry',
    templateUrl: './sponsor-admin-entry.component.html',
    styleUrls: ['./sponsor-admin-entry.component.scss'],
    standalone: false
})
export class SponsorAdminEntryComponent {
  @Input() sponsor?: Sponsor;
  @Output() requestDelete = new EventEmitter<string>();
  @Output() requestRefresh = new EventEmitter<void>();

  protected fa = fa;

  constructor(private modalService: ModalConfirmService) { }

  handleDelete(sponsorId: string) {
    this.requestDelete.emit(sponsorId);
  }

  handleEdit(sponsor: Sponsor) {
    this.modalService.openComponent<SponsorEditModalComponent>({
      content: SponsorEditModalComponent,
      context: {
        editingSponsor: sponsor,
        onSave: () => this.requestRefresh.emit()
      },
      modalClasses: ["modal-xl"]
    });
  }
}
