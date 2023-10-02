import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { ModalConfirmService } from '../../../services/modal-confirm.service';
import { ModalConfirmConfig } from './modal.models';


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
        this.modalService.openConfirm(this.config);
      }
    };
  }
}
