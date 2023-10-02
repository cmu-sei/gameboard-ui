import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { Sponsor } from '@/api/sponsor-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SponsorEditModalComponent, SponsorEditModalContext } from '../sponsor-edit-modal/sponsor-edit-modal.component';

@Component({
  selector: 'app-sponsor-admin-entry',
  templateUrl: './sponsor-admin-entry.component.html',
  styleUrls: ['./sponsor-admin-entry.component.scss']
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
    this.modalService.openComponent<SponsorEditModalComponent, SponsorEditModalContext>({
      content: SponsorEditModalComponent,
      context: {
        editingSponsor: sponsor,
        onSave: () => this.requestRefresh.emit()
      },
      modalClasses: ["modal-dialog-centered", "modal-xl"]
    });
  }
}
