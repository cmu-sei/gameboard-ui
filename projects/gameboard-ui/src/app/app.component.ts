// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { TocFile, TocService } from './api/toc.service';
import { ApiUser } from './api/user-models';
import { ConfigService } from './utility/config.service';
import { LayoutService } from './utility/layout.service';
import { UserService } from './utility/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user$: Observable<ApiUser | null>;
  toc$: Observable<TocFile[]>;
  custom_bg = "";
  env: any;

  constructor (
    private usersvc: UserService,
    private config: ConfigService,
    public layoutService: LayoutService,
    @Inject(DOCUMENT) private document: Document,
    toc: TocService,
    title: Title
  ) {
    this.user$ = usersvc.user$;
    this.toc$ = toc.toc$;
    title.setTitle(this.config.settings.appname || 'Gameboard');

    this.custom_bg = this.config.settings.custom_background || "";
    if (this.custom_bg) {
      document.getElementsByTagName('body')[0].classList.add(this.custom_bg);
    }
  }

  logout(): void {
    this.usersvc.logout();
  }
}
