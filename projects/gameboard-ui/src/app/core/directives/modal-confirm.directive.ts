import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { ModalConfirmService } from '../../services/modal-confirm.service';

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
export class ModalConfirmDirective implements AfterViewInit {
  @Input('appModalConfirm') config?: ModalConfirmConfig;

  constructor(private buttonRef: ElementRef, private modalService: ModalConfirmService) { }

  ngAfterViewInit(): void {
    const existingOnClick = this.buttonRef.nativeElement.onclick;

    this.buttonRef.nativeElement.onclick = () => {
      if (existingOnClick) {
        existingOnClick();
      }

      if (this.config) {
        this.modalService.open(this.config);
      }
    }
  }
}
