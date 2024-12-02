// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { LayoutService } from './utility/layout.service';
import { ConfigService } from './utility/config.service';
import { AuthService } from './utility/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  private config = inject(ConfigService);
  private autoLogin: {
    enabled: boolean;
    tried: boolean;
  };

  protected customBackground = "custom-bg-black";
  stickyMenu$: Observable<boolean>;

  constructor(
    layoutService: LayoutService,
    private title: Title,
    @Inject(DOCUMENT) private document: Document) {
    this.autoLogin = { enabled: this.config.environment.settings.oidc.autoLogin === true, tried: false };
    this.stickyMenu$ = layoutService.stickyMenu$;
  }

  async ngOnInit() {
    this.title.setTitle(this.config.environment.settings.appname || 'Gameboard');
    if (this.config.environment.settings.custom_background) {
      this.document.body.classList.add(this.config.environment.settings.custom_background);
      this.customBackground = this.config.environment.settings.custom_background || this.customBackground;
    }

    if (this.autoLogin.enabled && !this.autoLogin.tried && !await this.auth.isLoggedIn()) {
      this.autoLogin.tried = true;
      await this.auth.login();
    }
  }
}
