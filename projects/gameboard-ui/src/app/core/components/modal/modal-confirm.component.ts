import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IModalReady, ModalConfirmConfig } from '@/core/components/modal/modal.models';

@Component({
  selector: 'app-modal-confirm',
  template: `
    <div class="modal-confirm-component">
      <div class="modal-header">
          <h4 class="modal-title pull-left">{{ context.title }}</h4>
          <button *ngIf="!context.hideCancel" type="button" class="btn-close close pull-right" aria-label="Close" (click)="cancel()">
              <span aria-hidden="true" class="visually-hidden">&times;</span>
          </button>
      </div>
      <div class="modal-body" *ngIf="!context.renderBodyAsMarkdown; else markdownBodyContent" [innerHTML]="context.bodyContent.trim()"></div>
      <div class="modal-footer">
          <button type="button" *ngIf="context.hideCancel !== true" class="btn btn-outline-info" (click)="cancel()">{{ context.cancelButtonText || "Cancel" }}</button>
          <button type="button" class="btn btn-danger" (click)="confirm()">{{ context.confirmButtonText || 'OK' }}</button>
      </div>
    </div>

    <ng-template #markdownBodyContent>
      <div class="markdown-body-content p-4">
        <markdown [data]="context.bodyContent"></markdown>
      </div>
    </ng-template>
  `,
  styleUrls: ['./modal-confirm.component.scss']
})
export class ModalConfirmComponent implements IModalReady<ModalConfirmConfig> {
  context!: ModalConfirmConfig;
  private isConfirmed = false;

  constructor(protected modalRef: BsModalRef) { }

  confirm() {
    if (this.context.onConfirm) {
      this.isConfirmed = true;
      this.context.onConfirm();
    }

    this.modalRef.hide();
  }

  cancel() {
    // ensure that we don't do both cancel and confirm
    if (!this.isConfirmed && this.context.onCancel) {
      this.context.onCancel();
    }

    this.modalRef.hide();
  }
}
