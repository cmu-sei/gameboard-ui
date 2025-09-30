// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Game } from '@/api/game-models';
import { Player, Team } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
import { TeamService } from '@/api/team.service';
import { LogService } from '@/services/log.service';
import { NowService } from '@/services/now.service';
import { UserService } from '@/utility/user.service';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable, combineLatest, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface SessionStartCountdownContext {
  game: Game;
  player: Player;
  team: Team;
  isOneDaySessionWindow: boolean;
  secondsRemaining?: number;
  sessionLengthInMinutes: number;
}

@Component({
    selector: 'app-session-start-countdown',
    templateUrl: './session-start-countdown.component.html',
    styleUrls: ['./session-start-countdown.component.scss'],
    standalone: false
})
export class SessionStartCountdownComponent implements OnChanges {
  @Input() game?: Game;
  @Output() countdownElapsed = new EventEmitter<SessionStartCountdownContext>();

  protected ctx$: Observable<SessionStartCountdownContext | null> = of(null);

  constructor(
    private localUserService: UserService,
    private log: LogService,
    private now: NowService,
    private playerService: PlayerService,
    private teamService: TeamService) { }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.game?.currentValue && changes.game.currentValue.id !== changes.game?.previousValue?.id) {
      this.buildContext(changes.game.currentValue);
    }
  }

  private buildContext(game: Game) {
    const localUserId = this.localUserService.user$.value?.id;
    if (!localUserId) {
      this.log.logError("Couldn't load countdown component - the user isn't authenticated.");
    }

    this.ctx$ = this.playerService.list({ gid: game.id, uid: localUserId }).pipe(
      map(players => ({
        game,
        players
      })),
      switchMap(ctx => {
        if (ctx.players.length !== 1) {
          this.log.logError(`Couldn't resolve a player with gameId "${ctx.game.id}" and userId ${localUserId}`);
          return {} as unknown as Observable<[Game, Player, Team]>;
        }

        return combineLatest([
          of(ctx.game),
          of(ctx.players[0]),
          this.teamService.get(ctx.players[0].teamId),
          timer(0, 1000)
        ]);
      }),
      map(([game, player, team]) => ({ game, player, team })),
      map(ctx => {
        const beginDateTime = DateTime.fromJSDate(ctx.player.sessionBegin);
        const endDateTime = DateTime.fromJSDate(ctx.player.sessionEnd);
        const nowDateTime = DateTime.fromJSDate(this.now.now());
        const sessionLengthMinutes = endDateTime.diff(beginDateTime).as("minutes");
        const secondsRemaining = this.calcSecondsRemaining(beginDateTime, nowDateTime);

        const finalCtx = {
          game: ctx.game,
          player: ctx.player,
          team: ctx.team,
          isOneDaySessionWindow: beginDateTime.year === endDateTime.year &&
            beginDateTime.month === endDateTime.month &&
            beginDateTime.day === endDateTime.day,
          secondsRemaining: secondsRemaining,
          sessionLengthInMinutes: sessionLengthMinutes
        };

        if (secondsRemaining < 1) {
          this.countdownElapsed.emit(finalCtx);
        }

        return finalCtx;
      })
    );
  }

  private calcSecondsRemaining(sessionBegin: DateTime, now: DateTime): number {
    const timeRemaining = sessionBegin.diff(now);
    return Math.round(timeRemaining.as('seconds'));
  }
}
