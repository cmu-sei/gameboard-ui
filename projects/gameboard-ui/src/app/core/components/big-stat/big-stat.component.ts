// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-big-stat',
    templateUrl: './big-stat.component.html',
    styleUrls: ['./big-stat.component.scss'],
    standalone: false
})
export class BigStatComponent {
  @Input() label = "";
  @Input() value: string | number | undefined = "";
  @Input() subLabel? = "";
  @Input() isClickable = false;
}
