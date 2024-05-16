import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { first, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.scss']
})
export class ModalContentComponent<T> {
  @Input() hideCancel = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() subSubtitle?: string;
  @Input() cancelButtonText?: string;
  @Input() confirmButtonText?: string;
  @Input() isDangerConfirm = false;

  @Output() confirm = new EventEmitter<void>();

  constructor(private modalService: ModalConfirmService) { }

  protected handleClose() {
    this.modalService.hide();
  }

  protected async handleConfirm() {
    this.confirm.emit();
    this.modalService.hide();
  }
}
