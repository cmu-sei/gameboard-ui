// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-component">
      <ng-container *ngIf="textPosition === 'top'">
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
      </ng-container>
    
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
        y="0px" attr.width="{{ size == 'small' ? 56 : 108}}px" height="132px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;"
        xml:space="preserve" [class.default-theme]="!color">
        <rect x="0" y="10" width="4" height="10" [attr.fill]="color" opacity="0.2">
          <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.9s"
            repeatCount="indefinite" />
          <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.9s"
            repeatCount="indefinite" />
          <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.9s"
            repeatCount="indefinite" />
        </rect>
        <rect x="8" y="10" width="4" height="10" [attr.fill]="color" [attr.stroke]="color" opacity="0.2">
          <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.9s"
            repeatCount="indefinite" />
          <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.9s"
            repeatCount="indefinite" />
          <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.9s"
            repeatCount="indefinite" />
        </rect>
        <rect x="16" y="10" width="4" height="10" [attr.fill]="color" [attr.stroke]="color" opacity="0.2">
          <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.9s"
            repeatCount="indefinite" />
          <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.9s"
            repeatCount="indefinite" />
          <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.9s"
            repeatCount="indefinite" />
        </rect>
      </svg>

      <ng-container *ngIf="textPosition !== 'top'">
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
      </ng-container>
    </div>

    <ng-template #contentTemplate>
      <h1><ng-content></ng-content></h1>
    </ng-template>
  `,
  styles: [
    ".spinner-component { width: 100%; text-align: center; margin: 0 auto; }",
    "h1 { font-size: 0.85rem !important; font-weight: bold; text-transform: uppercase; }"
  ],
})
export class SpinnerComponent {
  @Input() color?: string = "#41ad57";
  @Input() size?: "small" | "medium" = "medium";
  @Input() textPosition: "top" | "bottom" = "top";
}
