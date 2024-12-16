// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CamelspacePipe } from '../../pipes/camelspace.pipe';
import { AlertModule } from 'ngx-bootstrap/alert';

@Component({
  selector: 'app-error-div',
  standalone: true,
  imports: [
    CommonModule,
    AlertModule,
    CamelspacePipe
  ],
  template: `
    <alert class="d-block m-2" *ngFor="let e of errors" type="danger" [dismissible]="true" (onClosed)="closed(e)">
      {{e.error?.message || e.message || e | camelspace}}
    </alert>
  `
})
export class ErrorDivComponent {
  @Input() errors!: any[];
  @Output() dismissed = new EventEmitter<any>();

  constructor() { }

  closed(e: any): void {
    const i = this.errors.indexOf(e);
    if (i >= 0) {
      this.errors.splice(i, 1);
    }

    this.dismissed.emit(e);
  }
}
