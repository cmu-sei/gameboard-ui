// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Game } from '../../../api/game-models';
import { GameService } from '../../../api/game.service';
import { AppTitleService } from '@/services/app-title.service';

@Component({
  selector: 'app-scoreboard-page',
  templateUrl: './scoreboard-page.component.html',
  styleUrls: ['./scoreboard-page.component.scss']
})
export class ScoreboardPageComponent {
  game$: Observable<Game>;
  isLegacyScoreboard = true;

  constructor(
    route: ActivatedRoute,
    api: GameService,
    title: AppTitleService
  ) {
    this.game$ = route.params.pipe(
      filter(p => !!p.id),
      switchMap(p => api.retrieve(p.id)),
      tap(game => title.set(`Scoreboard: ${game.name}`))
    );
  }
}
