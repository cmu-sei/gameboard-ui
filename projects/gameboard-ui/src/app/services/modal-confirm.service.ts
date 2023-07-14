import { Injectable, OnDestroy, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalConfirmComponent } from '../core/components/modal/modal-confirm.component';
import { ModalConfig, ModalConfirmConfig } from '@/core/components/modal/modal.models';

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
    this.bsModalRef = this.openWithDefaultStyles({ content: ModalConfirmComponent, context: config as Partial<ModalConfirmComponent> });

    if (config.onCancel) {
      this.hiddenSub = this.bsModalRef.onHidden?.subscribe(s => this.onHidden(config.onCancel));
    }
  }

  openComponent<TComponent, TContext extends Partial<TComponent>>(config: ModalConfig<TComponent, TContext>) {
    this.openWithDefaultStyles(config);
  }

  hide(isCancelEvent = false): void {
    if (!isCancelEvent) {
      this.hiddenSub?.unsubscribe();
    }

    this.bsModalRef?.hide();
    this.cleanupModalRef();
  }

  private openWithDefaultStyles<TComponent, TContext extends Partial<TComponent>>(config: ModalConfig<TComponent, TContext>) {
    return this.bsModalService.show(config.content, {
      initialState: { context: { ...config.context } } as unknown as Partial<TComponent>,
      class: config.modalClasses || "modal-dialog-centered",
    } as ModalOptions<TComponent>);
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
