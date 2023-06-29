// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { GameService } from './api/game.service';
import { TocFile, TocService } from './api/toc.service';
import { ApiUser } from './api/user-models';
import { ConfigService } from './utility/config.service';
import { LayoutService } from './utility/layout.service';
import { UserService } from './utility/user.service';
import { PracticeService } from './services/practice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user$!: Observable<ApiUser | null>;
  toc$!: Observable<TocFile[]>;
  custom_bg = "";
  env: any;
  isPracticeModeEnabled = false;

  constructor(
    private usersvc: UserService,
    private config: ConfigService,
    private gamesApi: GameService,
    public layoutService: LayoutService,
    @Inject(DOCUMENT) private document: Document,
    private practiceService: PracticeService,
    private toc: TocService,
    private title: Title
  ) { }

  async ngOnInit(): Promise<void> {
    this.user$ = this.usersvc.user$;
    this.toc$ = this.toc.toc$;
    this.title.setTitle(this.config.settings.appname || 'Gameboard');

    this.custom_bg = this.config.settings.custom_background || "";
    if (this.custom_bg) {
      this.document.body.classList.add(this.custom_bg);
    }

    this.isPracticeModeEnabled = await this.practiceService.isEnabled();
  }

  logout(): void {
    this.usersvc.logout();
  }
}
