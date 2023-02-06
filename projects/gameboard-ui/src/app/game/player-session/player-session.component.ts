// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { faBolt, faCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WindowService } from 'projects/gameboard-ui/src/services/window.service';
import { Observable, Subscription, BehaviorSubject, timer } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { GameContext } from '../../api/models';
import { Player, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ModalConfirmComponent } from '../../core/components/modal/modal-confirm.component';
import { ModalConfirmConfig } from '../../core/directives/modal-confirm.directive';
import { LogService } from '../../services/log.service';
import { UnityService } from '../../unity/unity.service';
import { HubEvent, HubState, NotificationService } from '../../utility/notification.service';

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
    private log: LogService,
    private unityService: UnityService,
    private windowService: WindowService,
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
    })).subscribe();

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
      finalize(() => sub.unsubscribe())
    ).subscribe(
      p => {
        this.ctx.player$.next(p);
      },
      err => this.errors.push(err),
      () => this.doublechecking = false
    );
  }

  async reset(p: Player): Promise<void> {
    await this.api.delete(p.id).toPromise();
    this.ctx.player$.next({ userId: p.userId } as Player);

    if (this.ctx.game?.mode === 'unity') {
      try {
        await this.unityService.undeployGame({ ctx: { gameId: p.gameId, teamId: p.teamId } }).toPromise();
      }
      catch (err) {
        this.log.logWarning("Couldn't undeploy the external game:", err);
      }

      this.windowService.get()?.location.reload();
    }
  }

  showConfirmTeamReset(p: Player) {
    this.modalService.show(ModalConfirmComponent, { initialState: { config: this.modalConfig } });
  }

  confirmResetTeam(p: Player): void {
    this.modalService.hide(this.modalRef?.id);
    this.modalRef = undefined;
    this.reset(p);
  }

  private evaluateHasTeammates(state: HubState) {
    if (!state) {
      this.hasTeammates$.next(false);
      return;
    }

    this.hasTeammates$.next(state.actors.length > 1);
  }
}
