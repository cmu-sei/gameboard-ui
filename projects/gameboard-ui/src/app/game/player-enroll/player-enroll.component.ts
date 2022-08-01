// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { faCopy, faEdit, faPaste, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { Observable, Subscription, timer } from 'rxjs';
import { finalize, map, tap, delay } from 'rxjs/operators';
import { GameContext } from '../../api/models';
import { NewPlayer, Player, PlayerEnlistment, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ConfigService } from '../../utility/config.service';
import { HubEventAction, NotificationService } from '../../utility/notification.service';

@Component({
  selector: 'app-player-enroll',
  templateUrl: './player-enroll.component.html',
  styleUrls: ['./player-enroll.component.scss']
})
export class PlayerEnrollComponent implements OnInit {
  @Input() ctx!: GameContext;
  errors: any[] = [];
  code = '';
  invitation = '';
  faUser = faUser;
  faEdit = faEdit;
  faCopy = faCopy;
  faPaste = faPaste;
  faTrash = faTrash;
  token = '';
  ctx$: Observable<GameContext>;
  delayMs: number = 2000;
  ctxDelayed$: Observable<GameContext>;

  disallowedName: string | null = null;
  disallowedReason: string | null = null;

  constructor(
    private api: PlayerService,
    private config: ConfigService,
    private hub: NotificationService
  ) {
    this.ctx$ = timer(0, 1000).pipe(
      map(i => this.ctx),
      tap(ctx => {
        ctx.player.session = new TimeWindow(ctx.player.sessionBegin, ctx.player.sessionEnd);
        ctx.game.session = new TimeWindow(ctx.game.gameStart, ctx.game.gameEnd);
        ctx.game.registration = new TimeWindow(ctx.game.registrationOpen, ctx.game.registrationClose);
      }),
      tap((gc) => {
        if (gc.player.nameStatus && gc.player.nameStatus != 'pending') {
          if (this.disallowedName == null) {
            this.disallowedName = gc.player.name;
            this.disallowedReason = gc.player.nameStatus;
          }
        }
      })
    );

    // Delay needed to prevent an enroll refresh error; 2 seconds should be enough
    this.ctxDelayed$ = this.ctx$.pipe(
      delay(this.delayMs)
    )
  }


  ngOnInit(): void {
  }

  enroll(uid: string, gid: string): void {

    const model = { userId: uid, gameId: gid } as NewPlayer;

    const sub: Subscription = this.api.create(model).pipe(
      finalize(() => sub.unsubscribe())
    ).subscribe(
      p => this.enrolled(p),
      err => this.errors.push(err)
    );

  }

  invite(p: Player): void {
    const sub: Subscription = this.api.invite(p.id).pipe(
      tap(m => this.code = m.code),
      tap(m => this.invitation = `${this.config.absoluteUrl}game/teamup/${m.code}`),
      finalize(() => sub.unsubscribe())
    ).subscribe();
  }

  redeem(p: Player): void {
    const model = {
      playerId: p.id,
      code: this.token.split('/').pop()
    } as PlayerEnlistment;

    const sub: Subscription = this.api.enlist(model).pipe(
      tap(p => this.token = ''),
      finalize(() => sub.unsubscribe())
    ).subscribe(
      p => this.enrolled(p),
      err => this.errors.push(err)
    );
  }

  update(p: Player): void {
    if (!p.name.trim()) {
      p.name = '';
      return;
    }
    
    // If the user's name isn't the disallowed one, mark it as pending
    if (p.name != this.disallowedName) p.nameStatus = "pending";
    // Otherwise, if there is a disallowed reason as well, mark it as that reason
    else if (this.disallowedReason) p.nameStatus = this.disallowedReason;

    const sub: Subscription = this.api.update(p).pipe(
      finalize(() => sub.unsubscribe())
    ).subscribe(
      () => {
        this.api.transform(this.ctx.player);
      }
    );
  }

  delete(p: Player): void {
    const sub: Subscription = this.api.delete(p.id).pipe(
      finalize(() => sub.unsubscribe())
    ).subscribe(() =>
      this.enrolled({} as Player)
    );
  }

  enrolled(p: Player): void {
    this.ctx.player = p;
    if (this.ctx.game.allowTeam) {
      this.hub.init(p.id);
    }
  }
}
