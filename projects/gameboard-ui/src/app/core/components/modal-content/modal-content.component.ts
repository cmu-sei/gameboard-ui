import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.scss']
})
export class ModalContentComponent {
  @Input() hideCancel = false;
  @Input() title = "";
  @Input() subtitle = "";
  @Input() subSubtitle = "";
  @Input() cancelButtonText?: string;
  @Input() confirmButtonText?: string;
  @Input() onConfirm?: Function;

  constructor(private modalService: ModalConfirmService) { }

  protected handleClose() {
    this.modalService.hide();
  }

  protected handleConfirm() {
    // this?.onConfirm();
  }
}
