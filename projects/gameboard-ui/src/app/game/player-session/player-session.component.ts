// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, combineLatest, interval, Observable, of, Subject, Subscription } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { GameContext } from '../../api/models';
import { Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ModalConfirmComponent } from '../../core/components/modal/modal-confirm.component';
import { ModalConfirmConfig } from '../../core/directives/modal-confirm.directive';
import { FontAwesomeService } from '../../services/font-awesome.service';
import { GameboardPerformanceSummaryViewModel } from '../components/gameboard-performance-summary/gameboard-performance-summary.component';

@Component({
  selector: 'app-player-session',
  templateUrl: './player-session.component.html',
  styleUrls: ['./player-session.component.scss']
})
export class PlayerSessionComponent implements OnDestroy {
  @Input() ctx$!: Observable<GameContext | undefined>;
  @Output() onSessionStart = new EventEmitter<Player>();
  @Output() onSessionReset = new EventEmitter<Player>();

  errors: any[] = [];
  myCtx$!: Observable<GameContext | undefined>;

  private ctxSub?: Subscription;

  // sets up the modal if it's a team game that needs confirmation
  private modalRef?: BsModalRef;
  protected modalConfig?: ModalConfirmConfig;
  protected isDoubleChecking = false;
  protected performanceSummaryViewModel$ = new BehaviorSubject<GameboardPerformanceSummaryViewModel | undefined>(undefined);
  protected player$ = new BehaviorSubject<Player | undefined>(undefined);

  constructor(
    private api: PlayerService,
    private modalService: BsModalService,
    protected faService: FontAwesomeService
  ) { }

  async ngOnInit() {
    this.ctxSub = this.ctx$.pipe(
      tap(ctx => {
        let vm: GameboardPerformanceSummaryViewModel | undefined = undefined;

        if (ctx) {
          vm = {
            player: {
              id: ctx.player.id,
              teamId: ctx.player.teamId,
              session: ctx.player.session,
              scoring: {
                rank: ctx.player.rank,
                score: ctx.player.score,
                correctCount: ctx.player.correctCount,
                partialCount: ctx.player.partialCount
              }
            },
            game: {
              isPracticeMode: ctx.game.isPracticeMode
            }
          }
        }

        this.performanceSummaryViewModel$.next(vm);
        this.player$.next(ctx?.player);
      }),
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
    ).subscribe();
  }

  handleDoubleCheckingChanged(isDoubleChecking: boolean) {
    this.isDoubleChecking = isDoubleChecking;
  }

  handleStart(player: Player): void {
    this.api.start(player).pipe(
      first()
    ).subscribe(
      p => this.onSessionStart.emit(p),
      err => this.errors.push(err),
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
    this.ctxSub?.unsubscribe();
  }
}
