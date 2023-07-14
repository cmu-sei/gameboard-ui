import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IModalReady, ModalConfirmConfig } from '@/core/components/modal/modal.models';

@Component({
  selector: 'app-modal-confirm',
  template: `
    <div class="modal-confirm-component">
      <div class="modal-header">
          <h4 class="modal-title pull-left">{{ context.title }}</h4>
          <button type="button" class="btn-close close pull-right" aria-label="Close" (click)="cancel()">
              <span aria-hidden="true" class="visually-hidden">&times;</span>
          </button>
      </div>
      <div class="modal-body" *ngIf="!context.renderBodyAsMarkdown; else markdownBodyContent" [innerHTML]="context.bodyContent.trim()"></div>
      <div class="modal-footer">
          <button type="button" *ngIf="context.hideCancel !== true" class="btn btn-default" (click)="cancel()">{{ context.cancelButtonText || "Cancel" }}</button>
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
  // ngx-bootstrap's implementation is weird - this is magically
  // populated without an injection marker just by passing it to the service.show
  context!: ModalConfirmConfig;

  constructor(protected modalRef: BsModalRef) { }

  confirm() {
    if (this.context.onConfirm) {
      this.context.onConfirm();
    }

    this.modalRef.hide();
  }

  cancel() {
    if (this.context.onCancel) {
      this.context.onCancel();
    }

    this.modalRef.hide();
  }
}
