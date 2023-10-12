// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, firstValueFrom, merge, Observable, Subscription } from 'rxjs';
import { filter, first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { HubConnectionState } from '@microsoft/signalr';
import { ApiUser, PlayerRole } from '@/api/user-models';
import { GameService } from '@/api/game.service';
import { Game, GameContext } from '@/api/game-models';
import { HubEvent, HubEventAction, NotificationService } from '@/services/notification.service';
import { Player, TimeWindow } from '@/api/player-models';
import { PlayerService } from '../../../api/player.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { WindowService } from '@/services/window.service';
import { BoardPlayer } from '@/api/board-models';
import { BoardService } from '@/api/board.service';
import { fa } from '@/services/font-awesome.service';
import { GameHubService } from '@/services/signalR/game-hub.service';
import { LogService } from '@/services/log.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { RouterService } from '@/services/router.service';
import { AppTitleService } from '@/services/app-title.service';
import { UserService } from '@/api/user.service';
import { ConfigService } from '@/utility/config.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';

interface GameEnrollmentContext {
  game: Game;
  player: { id: string | null, teamId: string | null };
}

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements OnDestroy {
  ctx$ = new Observable<GameContext | undefined>(undefined);
  showCert = false;
  minDate = new Date(0);
  hubState$: Observable<HubConnectionState> = this.gameHubService.hubState$;

  protected boardPlayer?: BoardPlayer;
  protected canAdminEnroll$: Observable<boolean>;
  protected ctxIds: { userId?: string, gameId: string, playerId?: string } = { userId: '', gameId: '' };
  protected fa = fa;
  protected player$ = new BehaviorSubject<Player | null>(null);

  private isExternalGame = false;
  private syncStartChangedSubscription?: Subscription;
  private externalGameDeployStartSubscription?: Subscription;
  private hubEventsSubcription: Subscription;
  private localUserSubscription: Subscription;

  constructor(
    router: Router,
    route: ActivatedRoute,
    apiBoards: BoardService,
    apiPlayer: PlayerService,
    appTitle: AppTitleService,
    config: ConfigService,
    localUser: LocalUserService,
    userService: UserService,
    private apiGame: GameService,
    private hub: NotificationService,
    private logService: LogService,
    private gameHubService: GameHubService,
    private modalService: ModalConfirmService,
    private routerService: RouterService,
    private titleService: AppTitleService,
    private unsub: UnsubscriberService,
    private windowService: WindowService
  ) {
    const user$ = localUser.user$.pipe(map(u => !!u ? u : {} as ApiUser));
    this.canAdminEnroll$ = localUser.user$.pipe(map(u => !!u && userService.canEnrollAndPlayOutsideExecutionWindow(u)));

    const game$ = route.params.pipe(
      filter(p => !!p.id),
      switchMap(p => apiGame.retrieve(p.id)),
      tap(g => this.ctxIds.gameId = g.id),
      tap(g => this.isExternalGame = apiGame.isExternalGame(g)),
      tap(g => this.titleService.set(g.name)),
    );

    this.localUserSubscription = combineLatest([
      route.params,
      localUser.user$,
    ]).pipe(
      map(([routeParams, localUser]) => ({ gid: routeParams?.id, localUser: localUser })),
      switchMap(z => {
        return apiPlayer.list({ gid: z.gid, uid: z.localUser?.id, mode: 'Competition' }).pipe(
          map(
            p => {
              const defaultPlayer = { userId: z.localUser?.id } as unknown as Player;
              const resolvedPlayer = p.length !== 1 ? defaultPlayer : p[0];
              this.player$.next(resolvedPlayer);

              this.ctxIds.playerId = resolvedPlayer.id;
              this.ctxIds.userId = z.localUser?.id;

              return resolvedPlayer;
            }
          )
        );
      })
    ).subscribe(done => {
      const currentPlayer = this.player$.getValue();
      if (!currentPlayer?.id) {
        this.boardPlayer = undefined;
        return;
      }

      apiBoards.load(currentPlayer!.id).pipe(first()).subscribe(b => {
        this.boardPlayer = b;
        appTitle.set(`${this.boardPlayer?.game.name} | ${config.appName}`);
      });
    });

    // allow hub events to update the player subject
    this.hubEventsSubcription = combineLatest([
      localUser.user$,
      merge(
        hub.playerEvents,
        hub.teamEvents
      ).pipe(startWith({ action: HubEventAction.waiting } as HubEvent))
    ]).pipe(
      map(([localUser, hubEvent]) => ({ localUser, hubEvent })),
      map(playerEvent => {
        // this event relies on the hub, so we have to listen to it whether we generated it or not
        const currentPlayer = this.player$.getValue();

        if (playerEvent.hubEvent.action == HubEventAction.roleChanged && currentPlayer && playerEvent.hubEvent.actingUser.id !== currentPlayer.userId) {
          const isPromoted = playerEvent.hubEvent.model.id == currentPlayer.id;
          currentPlayer.role = isPromoted ? PlayerRole.manager : PlayerRole.member;
          currentPlayer.isManager = isPromoted;
          this.player$.next(currentPlayer);
        }

        // current implementation can ignore OTHER events generated by the local user
        if (playerEvent.hubEvent.actingUser?.id === localUser.user$.getValue()?.id) {
          return;
        }

        if (this.player$.getValue() == null && playerEvent.hubEvent.action == HubEventAction.waiting) {
          this.player$.next({ userId: playerEvent.localUser?.id } as Player);
          return;
        }

        if (playerEvent.hubEvent.action == HubEventAction.departed && playerEvent.hubEvent.actingUser?.id !== localUser.user$.getValue()?.id) {
          return;
        }

        if (playerEvent.hubEvent.action == HubEventAction.deleted) {
          this.gameHubService.leaveGame(this.ctxIds.gameId);
          this.showModal(playerEvent.hubEvent.actingUser?.name);
          this.player$.next(null);
        }

        if (playerEvent.hubEvent.action == HubEventAction.started) {
          const currentPlayer = this.player$.getValue();

          if (currentPlayer && playerEvent.hubEvent.model.sessionBegin) {
            currentPlayer.session = new TimeWindow(playerEvent.hubEvent.model.sessionBegin, playerEvent.hubEvent.model.sessionEnd);
            this.onSessionStarted(currentPlayer);
          }
        }
      })
    ).subscribe();

    this.ctx$ = combineLatest([user$, game$, this.player$]).pipe(
      map(([user, game, player]) => ({ user, game, player })),
      map(c => {
        return {
          user: c.user,
          game: c.game,
          player: c.player = c.player || { userId: c.user.id } as Player
        };
      }),
      tap(c => {
        // listen for game hub events to enable synchronized start stuff if needed
        if (c.player.gameId && c.game.requireSynchronizedStart) {
          this.gameHubService.joinGame(c.player.gameId);
        }
        else
          this.gameHubService.leaveGame(c.game.id);
      }),
      tap(c => { if (!c.game) { router.navigateByUrl("/"); } }),
      filter(c => !!c.game),
      tap(async ctx => {
        this.ctxIds.playerId = ctx.player.id;

        // join the team-up hub for this team/game
        if (ctx.player.teamId) {
          this.hub.init(ctx.player.teamId);
        }

        if (ctx.game && ctx.player?.id) {
          await this.maybeJoinGameHub({
            game: ctx.game,
            player: ctx.player
          });
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.hubEventsSubcription?.unsubscribe();
    this.localUserSubscription?.unsubscribe();
    this.syncStartChangedSubscription?.unsubscribe();
    this.externalGameDeployStartSubscription?.unsubscribe();
  }

  protected onSessionStarted(player: Player): void {
    this.player$.next(player);
  }

  protected async onEnroll(player: Player): Promise<void> {
    this.player$.next(player);
  }

  protected async onUnenroll(player: Player): Promise<void> {
    this.resetEnrollmentAndLeaveGame(player);
  }

  protected async onSessionReset(player: Player): Promise<void> {
    this.resetEnrollmentAndLeaveGame(player);
  }

  private async maybeJoinGameHub(ctx: GameEnrollmentContext) {
    if (ctx.game.requireSynchronizedStart || ctx.game.isTeamGame) {
      await this.gameHubService.joinGame(ctx.game.id);

      // if the game is sync start, we need to check if it's already going and move them along if so
      // we also need to wire up a listener to move them along when an external game launches
      if (ctx.game.requireSynchronizedStart) {
        await this.handleLiveSyncStartSessionJoined(ctx);

        this.unsub.add(
          this.gameHubService.externalGameLaunchStarted$.subscribe(startState => {
            if (startState)
              this.handleLiveSyncStartSessionJoined(ctx);
          })
        );
      }
    }
    else {
      this.logService.logInfo(`Not joining the hub for game ${ctx.game.id} - it's not a team game AND it doesn't require sync start.`);
    }
  }

  private async resetEnrollmentAndLeaveGame(player: Player) {
    await this.gameHubService.leaveGame(this.ctxIds.gameId);
    await this.hub.disconnect();

    this.player$.next(null);
    this.externalGameDeployStartSubscription?.unsubscribe();
    this.syncStartChangedSubscription?.unsubscribe();

    if (this.isExternalGame) {
      this.windowService.get().location.reload();
    }
  }

  private showModal(resettingPlayerName?: string): void {
    const resetInitiator = resettingPlayerName ? `your teammate "${resettingPlayerName}"` : "an administrator";

    this.modalService.openConfirm({
      title: "Session reset",
      bodyContent: `Your session was reset by ${resetInitiator}. We'll take you back to the game page so you can re-enroll if you'd like to.`,
      confirmButtonText: "Got it",
      hideCancel: true,
    });
  }

  private async handleLiveSyncStartSessionJoined(ctx: GameEnrollmentContext) {
    const startState = await firstValueFrom(this.apiGame.getSyncStartState(ctx.game.id));

    if (!ctx?.game?.session || !ctx.player.id || !startState) {
      this.logService.logError(`Couldn't enroll and join game "${ctx.game.id}". Start state was undefined or had no player id.`, startState, this.ctxIds.playerId);
      return;
    }

    this.logService.logWarning(`Game ${ctx.game.id} (player ${ctx.player.id}) is ${startState.isReady ? "" : "not"} ready to start.`);

    // NOTE: in https://github.com/cmu-sei/Gameboard/issues/249, we're tracking the fact that we really need a separate
    // data structure to record properties of the external game, including a better way to determine if we should redirect
    // a reloading/returning player to the game screen

    if (startState.isReady && ctx.game.session.isDuring && ctx.player.id) {
      this.logService.logWarning(`Game ${ctx.game.id} (player ${ctx.player.id}) is starting...`);
      this.routerService.goToGameStartPage({ gameId: ctx.game.id, playerId: ctx.player.id });
    }
  }
}
