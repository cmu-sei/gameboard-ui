// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { faBolt, faCircle, faDotCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Observable, Subscription, timer } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { BoardService } from '../../api/board.service';
import { GameContext } from '../../api/models';
import { Player, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { UnityService } from '../../unity/unity.service';
import { HubEvent, HubEventAction, HubState, NotificationService } from '../../utility/notification.service';

@Component({
  selector: 'app-player-session',
  templateUrl: './player-session.component.html',
  styleUrls: ['./player-session.component.scss']
})
export class PlayerSessionComponent implements OnInit {
  @Input() ctx!: GameContext;
  errors: any[] = [];
  ctx$: Observable<GameContext>;
  hub$: Observable<HubState>;
  teamEvents$: Observable<HubEvent>;
  doublechecking = false;

  faBolt = faBolt;
  faTrash = faTrash;
  faDot = faCircle;

  constructor (
    private api: PlayerService,
    private hub: NotificationService,
    private unityService: UnityService
  ) {
    this.ctx$ = timer(0, 1000).pipe(
      map(i => this.ctx),
      tap(ctx => {
        ctx.player.session = new TimeWindow(ctx.player.sessionBegin, ctx.player.sessionEnd);
        ctx.game.session = new TimeWindow(ctx.game.gameStart, ctx.game.gameEnd);
      })
    );

    this.hub$ = hub.state$.pipe();

    // listen for hub session events (update / start) to keep team sync'd
    this.teamEvents$ = hub.teamEvents.pipe(
      tap(e => {
        this.ctx.player = ({ ...this.ctx.player, ...e.model });
        this.api.transform(this.ctx.player);
        if (e.action === HubEventAction.deleted) {
          this.ctx.player = ({ userId: this.ctx.user.id }) as Player
        }
      })
    );
  }

  ngOnInit(): void {
    if (this.ctx.game.allowTeam) {
      if (!!this.ctx.player && !this.ctx.player.session.isAfter) {
        this.hub.init(this.ctx.player.teamId);
      }
    }
  }

  start(p: Player): void {
    const sub: Subscription = this.api.start(p).pipe(
      tap(p => p.session = new TimeWindow(p.sessionBegin, p.sessionEnd)),
      finalize(() => sub.unsubscribe())
    ).subscribe(
      p => this.ctx.player = p,
      err => this.errors.push(err),
      () => this.doublechecking = false
    );
  }



  reset(p: Player): void {
    if (this.ctx.game.mode == 'unity') {
      this.unityService.undeployGame({ gameId: p.gameId, teamId: p.teamId }).pipe(
        tap(() => this.api.delete(p.id).subscribe(() => {
          window.location.reload();
        }))
      ).subscribe();
    }
    else {
      this.api.delete(p.id).subscribe(() => {
        window.location.reload();
      });
    }
  }
}
