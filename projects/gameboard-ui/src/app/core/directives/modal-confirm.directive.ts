import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalConfirmComponent } from '../components/modal/modal-confirm.component';

export interface ModalConfirmConfig {
  bodyContent: string;
  title?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onCancel?: Function;
  onConfirm?: Function;
  hideCancel?: boolean;
}

@Directive({ selector: '[appModalConfirm]' })
export class ModalConfirmDirective implements OnDestroy, AfterViewInit {
  @Input('appModalConfirm') config?: ModalConfirmConfig;
  private modalRef?: BsModalRef;

  constructor(private buttonRef: ElementRef, private modalService: BsModalService) { }

  ngAfterViewInit(): void {
    const existingOnClick = this.buttonRef.nativeElement.onclick;

    this.buttonRef.nativeElement.onclick = () => {
      if (existingOnClick) {
        existingOnClick();
      }

      if (this.config) {
        this.modalRef = this.modalService.show(ModalConfirmComponent, {
          initialState: {
            config: this.config
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.modalRef) {
      this.modalRef.hide();
      this.modalRef = undefined;
    }
  }
}
