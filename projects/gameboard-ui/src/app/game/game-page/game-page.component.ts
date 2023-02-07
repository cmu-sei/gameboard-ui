// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { faCaretDown, faCaretRight, faExternalLinkAlt, faListOl } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap, tap, zipAll } from 'rxjs/operators';
import { GameService } from '../../api/game.service';
import { GameContext } from '../../api/models';
import { Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ApiUser } from '../../api/user-models';
import { ModalConfirmComponent } from '../../core/components/modal/modal-confirm.component';
import { HubEvent, HubEventAction, NotificationService } from '../../utility/notification.service';
import { ToastService } from '../../utility/services/toast.service';
import { UserService as LocalUserService } from '../../utility/user.service';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent {
  ctx$ = new Observable<GameContext | undefined>(undefined);
  showCert = false;
  faLink = faExternalLinkAlt;
  faList = faListOl;
  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;
  minDate = new Date(1, 1, 1, 0, 0, 0, 0);

  private playerSubject$ = new Subject<Player>();
  private modalRef?: BsModalRef;

  constructor(
    router: Router,
    route: ActivatedRoute,
    apiGame: GameService,
    apiPlayer: PlayerService,
    hub: NotificationService,
    local: LocalUserService,
    toasts: ToastService,
    private modalService: BsModalService,
  ) {
    const user$ = local.user$.pipe(
      map(u => !!u ? u : {} as ApiUser)
    );

    const game$ = route.params.pipe(
      filter(p => !!p.id),
      switchMap(p => apiGame.retrieve(p.id))
    );

    const player$ = combineLatest([
      route.params,
      local.user$,
      this.playerSubject$.asObservable().pipe(startWith(null)),
    ]).pipe(
      map(([routeParams, localUser, player]) => ({ gid: routeParams?.id, localUser: localUser, player })),
      switchMap(z => {
        // if we were given by another component who has access to the thing, use that instead
        if (z.player) {
          return of(z.player);
        }

        return apiPlayer.list({ gid: z.gid, uid: z.localUser?.id }).pipe(
          map(
            p => {
              const defaultPlayer = { userId: z.localUser?.id } as unknown as Player;
              if (!p.length || p.length > 1) {
                return defaultPlayer;
              }

              // otherwise, all is well
              return p[0];
            }
          )
        )
      })
    );

    // this is the result of the filter$ observable, but "deleted" by this pipeline
    // if the team has been deleted by this user or another player on their team
    const playerTeamStateFilter$ = combineLatest([
      player$,
      hub
        .teamEvents.pipe(
          distinctUntilChanged(),
          // we have to send something through this pipe in order to have all the observables complete at least the first time,
          // so we start with a "started" event (which we ignore below)
          startWith({ action: HubEventAction.started } as HubEvent),
          filter(hubEvent => hubEvent.action == HubEventAction.started || hubEvent.action == HubEventAction.deleted)
        )
    ]
    ).pipe(
      map(([player$, hubEvent]) => ({ player: player$, teamState: hubEvent })),
      map(playerTeamState => {
        if (playerTeamState.teamState.action == HubEventAction.deleted && playerTeamState.teamState.model.teamId == playerTeamState.player.teamId) {
          if (playerTeamState.teamState.model.actor.id != playerTeamState.player.userId) {
            this.showModal(playerTeamState.teamState.model?.actor.approvedName);
          }

          return { userId: playerTeamState.player.userId } as Player;
        }

        return playerTeamState.player;
      })
    );

    this.ctx$ = combineLatest([user$, game$, playerTeamStateFilter$]).pipe(
      map(([user, game, player]) => ({ user, game, player })),
      tap(c => {
        if (!c.game) { router.navigateByUrl("/"); }
      }),
      filter(c => !!c.game),
      map(c => ({ player$: this.playerSubject$, ...c })),
    )
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


