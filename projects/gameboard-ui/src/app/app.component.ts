// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ThrowStmt } from '@angular/compiler';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TocFile, TocService } from './api/toc.service';
import { ApiUser } from './api/user-models';
import { ConfigService } from './utility/config.service';
import { UserService } from './utility/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user$: Observable<ApiUser | null>;
  toc$: Observable<TocFile[]>;

  constructor(
    private usersvc: UserService,
    config: ConfigService,
    toc: TocService,
    title: Title
  ) {
    this.user$ = usersvc.user$;
    this.toc$ = toc.toc$;
    title.setTitle(config.settings.appname || 'Gameboard');
    if (config.settings.custom_background) {
      document.getElementsByTagName('body')[0].classList.add(config.settings.custom_background);
    }
  }

  logout(): void {
    this.usersvc.logout();
  }
}
