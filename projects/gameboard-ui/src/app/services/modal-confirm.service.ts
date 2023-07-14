import { Injectable, OnDestroy, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalConfirmComponent } from '../core/components/modal/modal-confirm.component';
import { ModalComponentConfig, ModalConfirmConfig } from '@/core/components/modal/modal.models';

// we treat this as a transient since it maintains a reference to its modal reference object
@Injectable()
export class ModalConfirmService implements OnDestroy {
  private bsModalRef?: BsModalRef;
  private hiddenSub?: Subscription;

  constructor(private bsModalService: BsModalService) { }

  ngOnDestroy(): void {
    this.cleanupModalRef();
  }

  open(config: ModalConfirmConfig): void {
    this.openConfirm({ ...config, hideCancel: true });
  }


  openConfirm(config: ModalConfirmConfig): void {
    this.bsModalRef = this.openWithDefaultStyles(ModalConfirmComponent, config)

    if (config.onCancel) {
      this.hiddenSub = this.bsModalRef.onHidden?.subscribe(s => this.onHidden(config.onCancel));
    }
  }

  openComponent<T>(config: ModalComponentConfig<T>) {
    this.bsModalService.show(config.templateRef, { initialState: { config: config.context } });
  }

  hide(isCancelEvent = false): void {
    if (!isCancelEvent) {
      this.hiddenSub?.unsubscribe();
    }

    this.bsModalRef?.hide();
    this.cleanupModalRef();
  }

  private openWithDefaultStyles<TComponent>(content: string | TemplateRef<any> | { new(...args: any[]): TComponent; }, config?: Partial<TComponent>) {
    return this.bsModalService.show(content, { initialState: config, class: "modal-dialog-centered" });
  }

  private onHidden(onCancel?: Function, suppressOnCancel = false): void {
    if (!suppressOnCancel && !!onCancel) {
      onCancel();
    }

    this.cleanupModalRef();
  }

  private cleanupModalRef(): void {
    this.bsModalRef = undefined;
  }
}
