// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './utility/auth.service';
import { ConfigService } from './utility/config.service';
import { WindowService } from './services/window.service';
import { isClassificationBannerShown } from './standalone/core/components/classification-banner/classification-banner.component';
import { ClassificationBannerService } from './standalone/core/components/classification-banner/classification-banner.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  private config = inject(ConfigService);
  private document = inject(DOCUMENT);
  private theme = inject(ThemeService);
  private windowService = inject(WindowService);
  protected classificationBanner = inject(ClassificationBannerService);

  protected readonly headerBarSettings = this.config.environment.settings.HeaderBarSettings ?? {};
  protected readonly showClassificationBanner = isClassificationBannerShown(
    this.headerBarSettings,
    this.windowService.isFramed()
  );

  private autoLogin: {
    enabled: boolean;
    tried: boolean;
  };

  constructor(private title: Title) {
    this.autoLogin = { enabled: this.config.environment.settings.oidc.autoLogin === true, tried: false };
  }

  async ngOnInit() {
    this.title.setTitle(this.config.environment.settings.appname || 'Gameboard');
    const customBackground = this.theme.getThemeBgClass();
    if (customBackground) {
      this.document.body.classList.add(customBackground);
    }

    if (this.autoLogin.enabled && !this.autoLogin.tried && !await this.auth.isLoggedIn()) {
      this.autoLogin.tried = true;
      await this.auth.login();
    }
  }
}
