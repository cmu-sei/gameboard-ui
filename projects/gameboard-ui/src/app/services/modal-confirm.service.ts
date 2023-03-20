import { Component, Injectable, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ManageManualChallengeBonusesComponent } from '../admin/components/manage-manual-challenge-bonuses/manage-manual-challenge-bonuses.component';
import { ModalConfirmComponent } from '../core/components/modal/modal-confirm.component';
import { ModalConfirmConfig } from '../core/directives/modal-confirm.directive';

export interface IModalReady<T> {
  constructor: (new (...args: any[]) => T);
  config: Partial<T>;
}

// we treat this as a transient since it maintains a reference to its modal reference object
@Injectable()
export class ModalConfirmService implements OnDestroy {
  private bsModalRef?: BsModalRef;
  private hiddenSub?: Subscription;

  constructor(private bsModalService: BsModalService) { }

  openConfirm<T>(config: ModalConfirmConfig): void {
    this.bsModalRef = this.bsModalService.show(ModalConfirmComponent, { initialState: { config }, class: "modal-dialog-centered" });

    if (config.onCancel) {
      this.hiddenSub = this.bsModalRef.onHidden?.subscribe(s => this.onHidden(config.onCancel));
    }
  }

  // open<TComponent extends IModalReady<TComponent>>(componentType: TComponent, config?: Partial<TComponent>): void {
  //   console.log("config", config);
  //   this.bsModalRef = this.bsModalService.show(componentType, { initialState: { config }, class: "modal-dialog-centered" });
  // }

  // open<TConfig>(config?: { teamId: string}): void {
  //   console.log("config", config);
  //   this.bsModalRef = this.bsModalService.show(ManageManualChallengeBonusesComponent, { initialState: { config }, class: "modal-dialog-centered" });
  // }

  hide(isCancelEvent = false): void {
    if (!isCancelEvent) {
      this.hiddenSub?.unsubscribe();
    }

    this.bsModalRef?.hide();
    this.cleanupModalRef();
  }

  ngOnDestroy(): void {
    this.cleanupModalRef();
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
