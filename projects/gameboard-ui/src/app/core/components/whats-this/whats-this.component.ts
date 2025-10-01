// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-whats-this',
    styles: [
        ".whats-this-container { display: inline }",
        ".has-tooltip { cursor: help }"
    ],
    template: `<div class="whats-this-container" [class.has-tooltip]="!!whatItIs" [tooltip]="whatItIs" [placement]="placement">
    <ng-content></ng-content>
  </div>`,
    standalone: false
})
export class WhatsThisComponent {
  @Input() placement: "top" | "bottom" | "left" | "right" = "top";
  @Input() whatItIs = "";
}
