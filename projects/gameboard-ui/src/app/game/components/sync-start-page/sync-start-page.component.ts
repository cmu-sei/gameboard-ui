import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { combineLatest, Observable, of, Subscribable, Subscription, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Game } from '../../../api/game-models';
import { GameService } from '../../../api/game.service';
import { Player, Team } from '../../../api/player-models';
import { PlayerService } from '../../../api/player.service';
import { TeamService } from '../../../api/team.service';
import { LogService } from '../../../services/log.service';
import { NowService } from '../../../services/now.service';
import { RouterService } from '../../../services/router.service';
import { UserService } from '../../../utility/user.service';

interface SyncStartPageContext {
  game: Game;
  player: Player;
  team: Team;
  isOneDaySessionWindow: boolean;
  secondsRemaining?: number;
  sessionLengthInMinutes: number;
}

@Component({
  selector: 'app-sync-start-page',
  templateUrl: './sync-start-page.component.html',
  styleUrls: ['./sync-start-page.component.scss']
})
export class SyncStartPageComponent implements OnInit {
  protected ctx$?: Observable<SyncStartPageContext | undefined>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private gameService: GameService,
    private localUserService: UserService,
    private logService: LogService,
    private nowService: NowService,
    private playerService: PlayerService,
    private routerService: RouterService,
    private teamService: TeamService) { }

  async ngOnInit() {
    const userId = this.localUserService.user$.value?.id;
    if (!userId) {
      this.logService.logError("Can't access sync start if the user isn't authenticated.");
      this.routerService.goHome();
      return;
    }

    this.ctx$ = this.activatedRoute.paramMap.pipe(
      switchMap(paramMap => {
        const gameId = paramMap.get("gameId");

        if (!gameId) {
          this.logService.logError("Can't set up the sync start page without a gameId.");
          this.routerService.tryGoBack();
          return of({} as unknown as Game);
        }

        return this.gameService.retrieve(gameId);
      }),
      switchMap(game => {
        if (game) {
          this.logService.logError("Couldn't resolve game.");
        }

        return combineLatest([
          of(game),
          this.playerService.list({ gid: game.id, uid: userId })
        ])
      }),
      map(([game, players]) => ({ game, players })),
      switchMap(ctx => {
        if (ctx.players.length !== 1) {
          this.logService.logError(`Couldn't resolve a player with gameId "${ctx.game.id}" and userId ${userId}`);
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
        const nowDateTime = DateTime.fromJSDate(this.nowService.now());
        const sessionLengthMinutes = endDateTime.diff(beginDateTime).as("minutes");
        const secondsRemaining = this.calcSecondsRemaining(beginDateTime, nowDateTime);

        if (secondsRemaining < 1) {
          this.routerService.router.navigateByUrl(`/game/${ctx.game.id}`);
        }

        return {
          game: ctx.game,
          player: ctx.player,
          team: ctx.team,
          isOneDaySessionWindow: beginDateTime.year === endDateTime.year &&
            beginDateTime.month === endDateTime.month &&
            beginDateTime.day === endDateTime.day,
          secondsRemaining: secondsRemaining,
          sessionLengthInMinutes: sessionLengthMinutes
        };
      })
    );
  }

  private calcSecondsRemaining(sessionBegin: DateTime, now: DateTime): number {
    const timeRemaining = sessionBegin.diff(now);
    return Math.round(timeRemaining.as('seconds'));
  }
}
