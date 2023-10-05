// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { LayoutService } from './utility/layout.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  stickyMenu$: Observable<boolean>;

  constructor(layoutService: LayoutService) {
    this.stickyMenu$ = layoutService.stickyMenu$;
  }
}
