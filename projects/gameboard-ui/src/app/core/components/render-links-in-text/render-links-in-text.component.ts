// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-render-links-in-text',
    templateUrl: './render-links-in-text.component.html',
    styleUrls: ['./render-links-in-text.component.scss'],
    standalone: false
})
export class RenderLinksInTextComponent {
  @Input() text: string = '';
}
