// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { faCaretDown, faCaretRight, faExternalLinkAlt, faListOl } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, combineLatest, Observable, of, scheduled, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap, tap, zipAll } from 'rxjs/operators';
import { GameService } from '../../api/game.service';
import { GameContext } from '../../api/models';
import { Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ApiUser } from '../../api/user-models';
import { LogService } from '../../services/log.service';
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

  constructor(
    router: Router,
    route: ActivatedRoute,
    apiGame: GameService,
    apiPlayer: PlayerService,
    hub: NotificationService,
    local: LocalUserService,
    log: LogService,
    toasts: ToastService
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
    ]).pipe(
      map(([routeParams, localUser]) => ({ gid: routeParams?.id, localUser: localUser })),
      switchMap(z => {
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

    const teamStateFilter$ = combineLatest([
      player$,
      hub.teamEvents.pipe(
        // we have to send something through this pipe in order to have all the observables complete at least the first time,
        // so we start with a "started" event (which we ignore below)
        startWith({ action: HubEventAction.started } as HubEvent),
        distinctUntilChanged(),
        filter(hubEvent => hubEvent.action == HubEventAction.started || hubEvent.action == HubEventAction.deleted),
        switchMap(hubEvent =>
          of({ teamId: hubEvent.model?.teamId, approvedName: hubEvent.model?.teamId, isDeleted: hubEvent.action == HubEventAction.deleted })
        ),
    ]).pipe(
          map([player, hubEvent] => { player$, hubEvent })
    );

    this.ctx$ = combineLatest([user$, game$, player$]).pipe(
      map(([user, game, player]) => ({ user, game, player })),
      tap(c => {
        if (!c.game) { router.navigateByUrl("/"); }
      }),
      filter(c => !!c.game),
      tap(c => console.log("setting ctx", c))
    );
  }
}
