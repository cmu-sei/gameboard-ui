// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-confirm-button',
  templateUrl: './confirm-button.component.html',
  styleUrls: ['./confirm-button.component.scss'],
})
export class ConfirmButtonComponent {
  @Input() btnClass = 'btn btn-success btn-sm';
  @Input() cancelButtonClass = 'btn btn-outline-secondary';
  @Input() componentContainerClass = '';
  @Input() disabled = false;
  @Input() isSubmit = false;

  @Output() confirm = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<boolean>();

  confirming = false;
  faCheck = faCheck;
  faTimes = faTimes;

  continue(yes?: boolean): void {
    if (!!yes) {
      this.confirm.emit(true);
    } else {
      this.cancel.emit(true);
    }
    this.confirming = false;
  }

  public stopConfirming() {
    this.confirming = false;
  }
}
