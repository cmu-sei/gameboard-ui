// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LayoutService } from './utility/layout.service';
import { ConfigService } from './utility/config.service';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  protected customBackground = "";
  stickyMenu$: Observable<boolean>;

  constructor(
    layoutService: LayoutService,
    private config: ConfigService,
    private title: Title,
    @Inject(DOCUMENT) private document: Document) {
    this.stickyMenu$ = layoutService.stickyMenu$;
  }

  ngOnInit(): void {
    this.title.setTitle(this.config.settings.appname || 'Gameboard');
    if (this.config.settings.custom_background) {
      this.document.body.classList.add(this.config.settings.custom_background);
      this.customBackground = this.config.settings.custom_background || 'custom-bg-black';
    }
  }
}
