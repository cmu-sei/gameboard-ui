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
import { UnsubscriberService } from './services/unsubscriber.service';

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
    public layoutService: LayoutService,
    @Inject(DOCUMENT) private document: Document,
    private practiceService: PracticeService,
    private toc: TocService,
    private title: Title,
    private unsub: UnsubscriberService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user$ = this.usersvc.user$;
    this.toc$ = this.toc.toc$;
    this.title.setTitle(this.config.settings.appname || 'Gameboard');

    if (this.config.settings.custom_background) {
      this.document.body.classList.add(this.config.settings.custom_background);
    }

    this.unsub.add(this.practiceService.isEnabled$.subscribe(isEnabled => this.updatePracticeModeEnabled(isEnabled)));
    this.isPracticeModeEnabled = await this.practiceService.isEnabled();
  }

  private updatePracticeModeEnabled(isEnabled: boolean) {
    this.isPracticeModeEnabled = isEnabled;
  }

  logout(): void {
    this.usersvc.logout();
  }
}
