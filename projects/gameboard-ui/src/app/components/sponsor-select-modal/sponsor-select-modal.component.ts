import { SponsorSelectComponent } from '@/users/components/sponsor-select/sponsor-select.component';
import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-sponsor-select-modal',
  templateUrl: './sponsor-select-modal.component.html',
  styleUrls: ['./sponsor-select-modal.component.scss'],
  standalone: true,
  imports: [SponsorSelectComponent]
})
export class SponsorSelectModalComponent {
  constructor(private modalRef: BsModalRef) { }
  protected handleModalClose() {
    this.modalRef.hide();
  }
}
