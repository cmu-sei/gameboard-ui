// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-confirm-button',
  templateUrl: './confirm-button.component.html',
  styleUrls: ['./confirm-button.component.scss'],
})
export class ConfirmButtonComponent implements OnInit {
  @Input() btnClass = 'btn btn-info btn-sm';
  @Input() cancelButtonClass = 'btn btn-outline-secondary';
  @Input() disabled = false;
  @Output() confirm = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<boolean>();

  confirming = false;
  faCheck = faCheck;
  faTimes = faTimes;

  constructor() { }

  ngOnInit(): void {
  }

  continue(yes?: boolean): void {
    if (!!yes) {
      this.confirm.emit(true);
    } else {
      this.cancel.emit(true);
    }
    this.confirming = false;
  }
}
