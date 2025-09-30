// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { fa } from '@/services/font-awesome.service';

@Component({
    selector: 'app-info-bubble',
    imports: [
        CommonModule,
        FontAwesomeModule,
        TooltipModule,
    ],
    styleUrls: ['./info-bubble.component.scss'],
    template: `<div class="d-inline info-bubble-component icon-container"><fa-icon *ngIf="icon" [icon]="icon" class="fa-circle" [tooltip]="tooltipText" size="sm"></fa-icon></div>`
})
export class InfoBubbleComponent {
  @Input() icon: IconDefinition = fa.infoCircle;
  @Input() tooltipText?: string;
}
