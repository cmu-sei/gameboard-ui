// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { faBolt, faCircle, faExternalLink, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { combineLatest, interval, Observable, of, Subscription } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { GameContext } from '../../api/models';
import { calculateCountdown, Player, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ModalConfirmComponent } from '../../core/components/modal/modal-confirm.component';
import { ModalConfirmConfig } from '../../core/directives/modal-confirm.directive';

@Component({
  selector: 'app-player-session',
  templateUrl: './player-session.component.html',
  styleUrls: ['./player-session.component.scss']
})
export class PlayerSessionComponent implements OnDestroy {
  @Input() ctx$!: Observable<GameContext | undefined>;
  @Input() player$?: Observable<Player | undefined>;
  @Output() onSessionStart = new EventEmitter<Player>();
  @Output() onSessionReset = new EventEmitter<Player>();

  errors: any[] = [];
  myCtx$!: Observable<GameContext | undefined>;
  doublechecking = false;

  faBolt = faBolt;
  faExternalLink = faExternalLink;
  faTrash = faTrash;
  faDot = faCircle;

  private countdownClockSubscription?: Subscription;

  // sets up the modal if it's a team game that needs confirmation
  private modalRef?: BsModalRef;
  protected modalConfig?: ModalConfirmConfig;

  constructor(
    private api: PlayerService,
    private modalService: BsModalService
  ) { }

  async ngOnInit() {
    this.myCtx$ = this.ctx$.pipe(
      tap(ctx => {
        if (ctx?.game.allowTeam) {
          this.modalConfig = {
            title: "Reset team session?",
            bodyContent: `
                <p>
                  If you reset your session, you'll also <strong>reset your teammates' sessions</strong>. If you want to rejoin the game, you'll need to re-enroll, 
                  reform your team, and start your session again.
                </p>
                <p>Are you sure you want to reset your team's session?</p>`,
            cancelButtonText: "Don't reset",
            confirmButtonText: "Reset",
            onConfirm: () => this.confirmResetTeam(ctx.player)
          };
        }
      })
    );

    this.countdownClockSubscription = combineLatest([this.ctx$, interval(1000)]).pipe(
      map(combo => combo[0]),
      tap(ctx => {
        if (!ctx)
          return;

        if (!ctx.player.session) {
          ctx.player.session = new TimeWindow(ctx.player.sessionBegin, ctx.player.sessionEnd);
        }
        else {
          ctx.player.session.countdown = calculateCountdown(ctx.player.session.isBefore, ctx.player.session.isAfter, ctx.player.sessionBegin, ctx.player.sessionEnd);
        }
        ctx.game.session = new TimeWindow(ctx.game.gameStart, ctx.game.gameEnd);
      }),
      map(_ => null)
    ).subscribe();
  }

  handleStart(player: Player): void {
    this.api.start(player).pipe(
      first()
    ).subscribe(
      p => {
        console.log("session", p);
        this.onSessionStart.emit(p)
      },
      err => this.errors.push(err),
      () => this.doublechecking = false
    );
  }

  handleReset(p: Player): void {
    this.api.resetSession(p).pipe(first()).subscribe(_ => {
      this.onSessionReset.emit(p);
    });
  }

  showConfirmTeamReset(p: Player) {
    this.modalService.show(ModalConfirmComponent, { initialState: { config: this.modalConfig } });
  }

  confirmResetTeam(p: Player): void {
    this.modalService.hide(this.modalRef?.id);
    this.modalRef = undefined;
    this.handleReset(p);
  }

  ngOnDestroy(): void {
    this.countdownClockSubscription?.unsubscribe();
  }
}
