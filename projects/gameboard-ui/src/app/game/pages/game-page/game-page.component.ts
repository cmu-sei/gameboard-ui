// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, firstValueFrom, merge, Observable, Subscription } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ApiUser, PlayerRole } from '@/api/user-models';
import { GameService } from '@/api/game.service';
import { Game, GameContext } from '@/api/game-models';
import { HubEvent, HubEventAction, NotificationService } from '@/services/notification.service';
import { Player, TimeWindow } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
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
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { GameHubEventWith, GameHubResourcesDeployStatus } from '@/services/signalR/game-hub.models';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

interface GameEnrollmentContext {
  game: Game;
  player: { id: string, teamId: string };
}

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
  providers: [UnsubscriberService]
})
export class GamePageComponent implements OnDestroy {
  ctx$ = new Observable<GameContext | undefined>(undefined);
  showCert = false;
  minDate = new Date(0);

  protected boardPlayer?: BoardPlayer;
  protected canAdminEnroll$: Observable<boolean>;
  protected ctxIds: { userId?: string, gameId: string, playerId?: string } = { userId: '', gameId: '' };
  protected fa = fa;
  protected isExternalGame = false;
  protected player$ = new BehaviorSubject<Player | null>(null);

  private hubEventsSubcription: Subscription;
  private localUserSubscription: Subscription;
  private launchStartedSubscription?: Subscription;
  private launchEndedSubscription?: Subscription;
  private launchProgressChangedSubscription?: Subscription;

  constructor(
    apiGame: GameService,
    route: ActivatedRoute,
    apiBoards: BoardService,
    apiPlayer: PlayerService,
    appTitle: AppTitleService,
    localUser: LocalUserService,
    private hub: NotificationService,
    private logService: LogService,
    private gameHubService: GameHubService,
    private modalService: ModalConfirmService,
    private permissionsService: UserRolePermissionsService,
    private routerService: RouterService,
    private titleService: AppTitleService,
    private windowService: WindowService
  ) {
    const user$ = localUser.user$.pipe(map(u => !!u ? u : {} as ApiUser));
    this.canAdminEnroll$ = this.permissionsService.can$('Play_IgnoreExecutionWindow');

    const game$ = route.params.pipe(
      filter(p => !!p.id),
      switchMap(p => apiGame.retrieve(p.id)),
      tap(g => this.ctxIds.gameId = g.id),
      tap(g => this.isExternalGame = g.mode == "external"),
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
    ).subscribe(async _ => {
      const currentPlayer = this.player$.getValue();
      if (!currentPlayer?.id) {
        this.boardPlayer = undefined;
        return;
      }

      this.boardPlayer = await firstValueFrom(apiBoards.load(currentPlayer.id));
      appTitle.set(`${this.boardPlayer.game.name}`);
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
        if (!c.game)
          this.routerService.goHome();
      }),
      filter(c => !!c.game),
      tap(async ctx => {
        // NOTE: even if they haven't enrolled, they have a ctx.player object. 
        // we have to make sure they actually have an id in order to confirm enrollment
        // and do things like join the game hub
        if (!ctx.player.id)
          return;

        this.ctxIds.playerId = ctx.player.id;

        // join the team-up hub for this team/game
        await this.hub.init(ctx.player.teamId);

        // if appropriate to the game execution period and modes,
        // join the hub that coordinates across everyone playing this game
        // (for sync start, external game launch, etc.)
        if (ctx.game.requireSynchronizedStart || this.isExternalGame) {
          this.logService.logInfo("This is an external or sync-start game. Listening for game hub events...");

          // wire up listeners to move the player along when sync start is ready
          const handleGameLaunchEvent = (ev: GameHubEventWith<GameHubResourcesDeployStatus>) => {
            if (ev.gameId == ctx.game.id && ev.teamIds.some(tId => tId == ctx.player.teamId)) {
              this.redirectToExternalGameLoadingPage(ctx);
            }
          };

          this.launchEndedSubscription?.unsubscribe();
          this.launchProgressChangedSubscription?.unsubscribe();
          this.launchStartedSubscription?.unsubscribe();

          this.launchEndedSubscription = this.gameHubService.launchEnded$.subscribe(handleGameLaunchEvent);
          this.launchProgressChangedSubscription = this.gameHubService.launchProgressChanged$.subscribe(handleGameLaunchEvent);
          this.launchStartedSubscription = this.gameHubService.launchStarted$.subscribe(handleGameLaunchEvent);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.hubEventsSubcription?.unsubscribe();
    this.localUserSubscription?.unsubscribe();
    this.launchStartedSubscription?.unsubscribe();
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

  private async resetEnrollmentAndLeaveGame(player: Player) {
    await this.hub.disconnect();

    this.player$.next(null);

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

  private redirectToExternalGameLoadingPage(ctx: GameEnrollmentContext) {
    this.logService.logInfo(`Game ${ctx.game.id} (player ${ctx.player.id}) is ready for redirect...`);
    this.routerService.goToExternalGameLoadingPage({ gameId: ctx.game.id, playerId: ctx.player.id });
  }
}
