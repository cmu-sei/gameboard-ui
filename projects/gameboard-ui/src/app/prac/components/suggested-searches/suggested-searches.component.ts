// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-suggested-searches',
    templateUrl: './suggested-searches.component.html',
    styleUrls: ['./suggested-searches.component.scss'],
    standalone: false
})
export class SuggestedSearchesComponent {
  @Input() searches: string[] = [];
}
