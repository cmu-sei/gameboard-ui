import { Injectable, OnDestroy, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalConfirmComponent } from '@/core/components/modal/modal-confirm.component';
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
    this.bsModalRef = this.openWithDefaultStyles({
      content: ModalConfirmComponent,
      context: { context: config },
      ignoreBackdropClick: config.ignoreBackdropClick,
      modalClasses: config.modalClasses
    });
  }

  openComponent<TComponent>(config: ModalConfig<TComponent>) {
    this.bsModalRef = this.openWithDefaultStyles(config);
  }

  openTemplate<T>(templateRef: TemplateRef<T>) {
    this.bsModalRef = this.bsModalService.show(templateRef, { class: "modal-dialog-centered modal-xl" });
  }

  openTemplateWithContext<TTemplate>(templateRef: TemplateRef<TTemplate>, context: any) {
    this.bsModalRef = this.bsModalService.show(templateRef, { class: "modal-dialog-centered modal-xl", initialState: context });
  }

  hide(isCancelEvent = false): void {
    if (!isCancelEvent) {
      this.hiddenSub?.unsubscribe();
    }

    this.bsModalRef?.hide();
    this.cleanupModalRef();
  }

  private openWithDefaultStyles<TComponent>(config: ModalConfig<TComponent>) {
    if (this.bsModalRef) {
      this.hide();
    }

    return this.bsModalService.show(config.content, {
      initialState: config.context as unknown as Partial<TComponent>,
      class: ["modal-dialog-centered", ...(config.modalClasses || [])].join(" "),
      ignoreBackdropClick: config.ignoreBackdropClick || false,
      scrollable: true
    } as ModalOptions<TComponent>);
  }

  private cleanupModalRef(): void {
    if (this.bsModalRef) {
      this.bsModalRef.hide();
    }

    this.bsModalRef = undefined;
  }
}
