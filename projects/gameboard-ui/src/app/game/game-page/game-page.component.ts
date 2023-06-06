// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, combineLatest, merge, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ApiUser, PlayerRole } from '../../api/user-models';
import { GameService } from '../../api/game.service';
import { GameContext } from '../../api/game-models';
import { HubEvent, HubEventAction, HubState, NotificationService } from '../../services/notification.service';
import { ModalConfirmComponent } from '../../core/components/modal/modal-confirm.component';
import { Player, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { UserService as LocalUserService } from '../../utility/user.service';
import { WindowService } from '../../services/window.service';
import { BoardPlayer } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { FontAwesomeService } from '@/services/font-awesome.service';
import { GameHubService } from '@/services/signalR/game-hub.service';
import { LogService } from '@/services/log.service';
import { HubConnectionState } from '@microsoft/signalr';

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
  protected ctxIds: { userId?: string, gameId: string, playerId?: string } = { userId: '', gameId: '' };
  protected playerSubject$ = new BehaviorSubject<Player | undefined>(undefined);

  private isExternalGame = false;
  private isEnrolled$ = new BehaviorSubject<boolean>(false);
  private syncStartChangedSubscription?: Subscription;
  private syncStartGameStartedSubscription?: Subscription;
  private hubEventsSubcription: Subscription;
  private localUserSubscription: Subscription;
  private playerSubscription: Subscription;

  constructor(
    router: Router,
    route: ActivatedRoute,
    apiBoards: BoardService,
    apiGame: GameService,
    apiPlayer: PlayerService,
    localUser: LocalUserService,
    public faService: FontAwesomeService,
    private hub: NotificationService,
    private logService: LogService,
    private gameHubService: GameHubService,
    private modalService: BsModalService,
    private windowService: WindowService
  ) {
    const user$ = localUser.user$.pipe(
      map(u => !!u ? u : {} as ApiUser)
    );

    const game$ = route.params.pipe(
      filter(p => !!p.id),
      switchMap(p => apiGame.retrieve(p.id)),
      tap(g => this.ctxIds.gameId = g.id),
      tap(g => this.isExternalGame = apiGame.isExternalGame(g)),
    );

    this.localUserSubscription = combineLatest([
      route.params,
      localUser.user$,
    ]).pipe(
      map(([routeParams, localUser]) => ({ gid: routeParams?.id, localUser: localUser })),
      switchMap(z => {
        return apiPlayer.list({ gid: z.gid, uid: z.localUser?.id }).pipe(
          map(
            p => {
              const defaultPlayer = { userId: z.localUser?.id } as unknown as Player;
              const resolvedPlayer = p.length !== 1 ? defaultPlayer : p[0];
              this.playerSubject$.next(resolvedPlayer);

              this.ctxIds.playerId = resolvedPlayer.id;
              this.ctxIds.userId = z.localUser?.id;

              return resolvedPlayer;
            }
          )
        );
      })
    ).subscribe(done => {
      const currentPlayer = this.playerSubject$.getValue();
      if (!currentPlayer?.id) {
        this.boardPlayer = undefined;
        return;
      }

      apiBoards.load(currentPlayer!.id).pipe(first()).subscribe(b => this.boardPlayer = b);
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
        const currentPlayer = this.playerSubject$.getValue();

        if (playerEvent.hubEvent.action == HubEventAction.roleChanged && currentPlayer && playerEvent.hubEvent.model.id !== currentPlayer.id) {
          const isPromoted = playerEvent.hubEvent.model.id == currentPlayer.id;
          currentPlayer.role = isPromoted ? PlayerRole.manager : PlayerRole.member;
          currentPlayer.isManager = isPromoted;
          this.playerSubject$.next(currentPlayer);
        }

        // current implementation can ignore OTHER events generated by the local user
        if (playerEvent.hubEvent.actingUser?.id === localUser.user$.getValue()?.id) {
          return;
        }

        if (this.playerSubject$.getValue() == null && playerEvent.hubEvent.action == HubEventAction.waiting) {
          this.playerSubject$.next({ userId: playerEvent.localUser?.id } as Player);
          return;
        }

        if (playerEvent.hubEvent.action == HubEventAction.departed && playerEvent.hubEvent.actingUser.id !== localUser.user$.getValue()?.id) {
          return;
        }

        if (playerEvent.hubEvent.action == HubEventAction.deleted) {
          this.showModal(playerEvent.hubEvent.actingUser.name);
          this.playerSubject$.next(undefined);
        }

        if (playerEvent.hubEvent.action == HubEventAction.started) {
          const currentPlayer = this.playerSubject$.getValue();

          if (currentPlayer && playerEvent.hubEvent.model.sessionBegin) {
            currentPlayer.session = new TimeWindow(playerEvent.hubEvent.model.sessionBegin, playerEvent.hubEvent.model.sessionEnd);
            this.onSessionStarted(currentPlayer);
          }
        }
      })
    ).subscribe();

    this.ctx$ = combineLatest([user$, game$, this.playerSubject$]).pipe(
      map(([user, game, player]) => ({ user, game, player })),
      map(c => {
        return {
          user: c.user,
          game: c.game,
          player: c.player = c.player || { userId: c.user.id } as Player
        };
      }),
      tap(ctx => {
        const isEnrolled = !!ctx.player.gameId;

        if (isEnrolled != this.isEnrolled$.value) {
          this.isEnrolled$.next(isEnrolled);
        }
      }),
      tap(c => { if (!c.game) { router.navigateByUrl("/"); } })
    );

    this.playerSubscription = combineLatest([game$, this.isEnrolled$]).pipe(
      map(([game, isEnrolled]) => ({ game, isEnrolled })),
      distinctUntilChanged()
    ).subscribe(async gameEnrollmentContext => {
      if (gameEnrollmentContext.isEnrolled && !!gameEnrollmentContext.game.id) {
        if (gameEnrollmentContext.game.requireSynchronizedStart) {
          await this.gameHubService.joinGame(gameEnrollmentContext.game.id);

          this.syncStartGameStartedSubscription = this.gameHubService.syncStartGameStarted$.subscribe(startState => {
            if (startState) {
              router.navigateByUrl(`/game/${startState.game.id}/sync-start`);
            }
          });
        }
        else {
          this.logService.logInfo(`Not joining the hub for game ${gameEnrollmentContext.game.id} - it doesn't require sync start.`);
        }
      }
      else {
        await this.gameHubService.leaveGame(this.ctxIds.gameId);
        this.syncStartGameStartedSubscription?.unsubscribe();
      }
    });
  }

  protected async onEnroll(player: Player): Promise<void> {
    this.playerSubject$.next(player);
  }

  protected async onUnenroll(player: Player): Promise<void> {
    await this.hub.disconnect();
    await this.gameHubService.leaveGame(player.gameId);
    this.playerSubject$.next(undefined);
  }

  protected onSessionStarted(player: Player): void {
    this.playerSubject$.next(player);
  }

  protected async onSessionReset(player: Player): Promise<void> {
    await this.hub.disconnect();
    this.playerSubject$.next(undefined);

    if (this.isExternalGame) {
      this.windowService.get().location.reload();
    }
  }

  ngOnDestroy(): void {
    this.hubEventsSubcription?.unsubscribe();
    this.localUserSubscription?.unsubscribe();
    this.playerSubscription?.unsubscribe();
    this.syncStartChangedSubscription?.unsubscribe();
    this.syncStartGameStartedSubscription?.unsubscribe();
  }

  private showModal(resettingPlayerName: string): void {
    this.modalService.show(
      ModalConfirmComponent, {
      initialState: {
        config: {
          title: "Session reset",
          bodyContent: `Your session was reset by your teammate "${resettingPlayerName}". We'll take you back to the game page so you can re-enroll if you'd like to.`,
          confirmButtonText: "Got it",
          hideCancel: true
        }
      },
      class: "modal-dialog-centered"
    });
  }
}
