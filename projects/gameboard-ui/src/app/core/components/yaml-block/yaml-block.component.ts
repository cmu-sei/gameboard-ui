// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-yaml-block',
    templateUrl: './yaml-block.component.html',
    styleUrls: ['./yaml-block.component.scss'],
    standalone: false
})
export class YamlBlockComponent {
  @Input() source: any;
}
