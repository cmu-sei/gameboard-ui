import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalConfirmConfig } from '../../directives/modal-confirm.directive';

@Component({
  selector: 'app-modal-confirm',
  template: `
    <div class="modal-confirm-component">
      <div class="modal-header">
          <h4 class="modal-title pull-left">{{ config.title }}</h4>
          <button type="button" class="btn-close close pull-right" aria-label="Close" (click)="cancel()">
              <span aria-hidden="true" class="visually-hidden">&times;</span>
          </button>
      </div>
      <div class="modal-body" *ngIf="!config.renderBodyAsMarkdown; else markdownBodyContent" [innerHTML]="config.bodyContent"></div>
      <div class="modal-footer">
          <button type="button" *ngIf="config.hideCancel !== true" class="btn btn-default" (click)="cancel()">{{ config.cancelButtonText || "Cancel" }}</button>
          <button type="button" class="btn btn-danger" (click)="confirm()">{{ config.confirmButtonText || 'OK' }}</button>
      </div>
    </div>

    <ng-template #markdownBodyContent>
      <div class="markdown-body-content p-4">
        <markdown [data]="config.bodyContent"></markdown>
      </div>
    </ng-template>
  `,
  styleUrls: ['./modal-confirm.component.scss']
})
export class ModalConfirmComponent {
  // ngx-bootstrap's implementation is weird - this is magically
  // populated without an injection marker just by passing it to the service.show
  config!: ModalConfirmConfig;

  constructor(protected modalRef: BsModalRef) { }

  confirm() {
    if (this.config.onConfirm) {
      this.config.onConfirm();
    }

    this.modalRef.hide();
  }

  cancel() {
    if (this.config.onCancel) {
      this.config.onCancel();
    }

    this.modalRef.hide();
  }
}
