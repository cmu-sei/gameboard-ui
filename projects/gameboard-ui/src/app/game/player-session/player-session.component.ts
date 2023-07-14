// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, firstValueFrom, Observable, Subscription } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { GameContext } from '../../api/models';
import { Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ModalConfirmComponent } from '../../core/components/modal/modal-confirm.component';
import { FontAwesomeService } from '../../services/font-awesome.service';
import { GameboardPerformanceSummaryViewModel } from '../components/gameboard-performance-summary/gameboard-performance-summary.component';
import { ModalConfirmConfig } from '@/core/components/modal/modal.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { LogService } from '@/services/log.service';

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
  player$ = new BehaviorSubject<Player | undefined>(undefined);
  playerObservable$ = this.player$.asObservable();

  private ctxSub?: Subscription;

  // sets up the modal if it's a team game that needs confirmation
  private modalRef?: BsModalRef;
  protected modalConfig?: ModalConfirmConfig;
  protected isDoubleChecking = false;
  protected performanceSummaryViewModel$ = new BehaviorSubject<GameboardPerformanceSummaryViewModel | undefined>(undefined);

  constructor(
    private api: PlayerService,
    private log: LogService,
    private modalService: ModalConfirmService,
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
          };
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

  async handleStart(player: Player): Promise<void> {
    const startedPlayer = await firstValueFrom(this.api.start(player));
    this.onSessionStart.emit(startedPlayer);
  }

  handleReset(p: Player): void {
    this.api.resetSession({ player: p, unenrollTeam: true }).pipe(first()).subscribe(_ => {
      this.onSessionReset.emit(p);
    });
  }

  showConfirmTeamReset(p: Player) {
    if (!this.modalConfig)
      throw new Error("Couldn't open the reset modal: no ModalConfig present.");

    this.modalService.openConfirm(this.modalConfig);
  }

  confirmResetTeam(p: Player): void {
    this.modalService.hide();
    this.handleReset(p);
  }

  ngOnDestroy(): void {
    this.ctxSub?.unsubscribe();
  }
}
