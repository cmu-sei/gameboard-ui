// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { faBolt, faCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, of, Subscription, BehaviorSubject, timer } from 'rxjs';
import { catchError, finalize, first, map, tap } from 'rxjs/operators';
import { GameContext } from '../../api/models';
import { Player, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ModalConfirmComponent } from '../../core/components/modal/modal-confirm.component';
import { ModalConfirmConfig } from '../../core/directives/modal-confirm.directive';
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
  hubState$: BehaviorSubject<HubState>;
  hasTeammates$ = new BehaviorSubject<boolean>(false);
  teamEvents$: Observable<HubEvent>;
  doublechecking = false;

  // sets up the modal if it's a team game that needs confirmation
  private modalRef?: BsModalRef;
  protected modalConfig?: ModalConfirmConfig;

  faBolt = faBolt;
  faTrash = faTrash;
  faDot = faCircle;

  constructor(
    private api: PlayerService,
    private hub: NotificationService,
    private unityService: UnityService,
    private modalService: BsModalService
  ) {
    this.ctx$ = timer(0, 1000).pipe(
      map(i => this.ctx),
      tap(ctx => {
        if (ctx.player && ctx.game) {
          ctx.player.session = new TimeWindow(ctx.player.sessionBegin, ctx.player.sessionEnd);
          ctx.game.session = new TimeWindow(ctx.game.gameStart, ctx.game.gameEnd);
        }
      })
    );

    this.hubState$ = this.hub.state$;
    hub.state$.pipe(tap(s => {
      this.evaluateHasTeammates(s);
    }));

    // listen for hub session events (update / start) to keep team sync'd
    this.teamEvents$ = hub.teamEvents.pipe(
      tap(e => {
        if (!this.ctx.player.id) {
          return;
        }

        this.ctx.player = ({ ...this.ctx.player, ...e.model });
        this.api.transform(this.ctx.player);
      })
    );
  }

  async ngOnInit() {
    if (this.ctx.game.allowTeam) {
      if (!!this.ctx.player && !this.ctx.player.session.isAfter) {
        await this.hub.init(this.ctx.player.teamId);
      }

      // if it's a team game, prep the modal config in case they reset with teammates
      this.modalConfig = {
        title: "Reset team session?",
        bodyContent: `
                <p>
                  If you reset your session, you'll also <strong>reset your teammates' sessions</strong> as well. If you want to rejoin the game, you'll need to re-enroll, 
                  reform your team, and start your session again.
                </p>
                <p>Are you sure you want to reset your team's session?</p>`,
        cancelButtonText: "Nevermind",
        confirmButtonText: "Reset",
        onConfirm: () => this.confirmResetTeam(this.ctx.player)
      };
    }
  }

  start(p: Player): void {
    const sub: Subscription = this.api.start(p).pipe(
      tap(p => p.session = new TimeWindow(p.sessionBegin, p.sessionEnd)),
      tap(p => console.log("started the session with p", p)),
      finalize(() => sub.unsubscribe())
    ).subscribe(
      p => {
        console.log("finalzed p", p);
        console.log("with ctx", this.ctx);
        this.ctx.player = p;
        console.log("So now ctx", this.ctx)
      },
      err => this.errors.push(err),
      () => this.doublechecking = false
    );
  }

  reset(p: Player): void {
    if (this.ctx.game?.mode == 'unity') {
      this.unityService.undeployGame({ ctx: { gameId: p.gameId, teamId: p.teamId } }).pipe(
        catchError(err => of("Player session couldn't undeploy the Unity game:", err)),
        first(),
        // management of state is taken care of at the level of the game page - 
        // they should get redirected after the hub tells them that their game is deleted
        tap(() => this.api.delete(p.id))
      ).subscribe();
    }
    else {
      this.api.delete(p.id).subscribe(() => {
        window.location.reload();
      });
    }
  }

  showConfirmTeamReset(p: Player) {
    this.modalService.show(ModalConfirmComponent, { initialState: { config: this.modalConfig } });
  }

  confirmResetTeam(p: Player): void {
    // TODO
    this.modalService.hide(this.modalRef?.id);
    this.modalRef = undefined;
    this.reset(p);
  }

  private evaluateHasTeammates(state: HubState) {
    console.log("got this hub state", state.actors.map(a => a.id));

    if (!!this.ctx.user?.id) {
      this.hasTeammates$.next(false);
      return;
    }

    const hasTeammates = state.actors.some(a => a.id != this.ctx.user!.id);
    this.hasTeammates$.next(hasTeammates);
  }
}
