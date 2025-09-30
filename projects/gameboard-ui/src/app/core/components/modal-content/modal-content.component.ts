// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
    selector: 'app-modal-content',
    templateUrl: './modal-content.component.html',
    styleUrls: ['./modal-content.component.scss'],
    standalone: false
})
export class ModalContentComponent<T> {
  @Input() hideCancel = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() subSubtitle?: string;
  @Input() cancelButtonText?: string;
  @Input() cancelDisabled = false;
  @Input() confirmButtonText?: string;
  @Input() confirmDisabled = false;
  @Input() isDangerConfirm = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  constructor(private modalService: ModalConfirmService) { }

  protected handleCancel() {
    this.cancel.emit();
    this.modalService.hide();
  }

  protected async handleConfirm() {
    this.confirm.emit();
    this.modalService.hide();
  }
}
