// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, firstValueFrom, interval, Observable, of, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GameContext } from '@/api/game-models';
import { Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { fa } from '@/services/font-awesome.service';
import { ModalConfirmConfig } from '@/core/components/modal/modal.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { TeamService } from '@/api/team.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

@Component({
    selector: 'app-player-session',
    templateUrl: './player-session.component.html',
    styleUrls: ['./player-session.component.scss'],
    standalone: false
})
export class PlayerSessionComponent implements OnDestroy {
  @Input() ctx$!: Observable<GameContext | undefined>;
  @Output() onSessionStart = new EventEmitter<Player>();
  @Output() onSessionReset = new EventEmitter<Player>();

  errors: any[] = [];
  isResetting = false;
  player$ = new BehaviorSubject<Player | undefined>(undefined);
  playerObservable$ = this.player$.asObservable();
  protected fa = fa;

  private ctxSub?: Subscription;

  // sets up the modal if it's a team game that needs confirmation
  protected modalConfig?: ModalConfirmConfig;
  protected isDoubleChecking = false;

  protected canAdminStart = false;
  protected canIgnoreSessionResetSettings$ = this.permissionsService.can$("Play_IgnoreSessionResetSettings");
  protected hasTimeRemaining = false;
  protected timeRemainingMs$?: Observable<number>;

  constructor(
    private api: PlayerService,
    private modalService: ModalConfirmService,
    private permissionsService: UserRolePermissionsService,
    private teamService: TeamService,
  ) { }

  async ngOnInit() {
    this.ctxSub = this.ctx$.pipe(
      tap(ctx => {
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
      }),
      tap(ctx => {
        this.canAdminStart = this.permissionsService.can('Play_IgnoreExecutionWindow');
      }),
      // set up countdown
      tap(ctx => {
        if (ctx?.player.session)
          this.timeRemainingMs$ = interval(1000).pipe(
            map(() => (ctx.player.session!.endDate.getTime() - Date.now())),
            tap(remainingMs => this.hasTimeRemaining = remainingMs > 0)
          );

        else
          this.timeRemainingMs$ = of(0);
      })
    ).subscribe();
  }

  handleDoubleCheckingChanged(isDoubleChecking: boolean) {
    this.isDoubleChecking = isDoubleChecking;
  }

  async handleStart(player: Player): Promise<void> {
    this.errors = [];
    try {
      const startedPlayer = await firstValueFrom(this.api.start(player));
      this.onSessionStart.emit(startedPlayer);
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  handleReset(p: Player): void {
    if (this.modalConfig) {
      // this is a team game, do team confirmation
      this.showConfirmTeamReset(p);
    } else {
      // it's an individual game, we've confirmed them to death enough
      this.doReset(p);
    }
  }

  showConfirmTeamReset(p: Player) {
    if (!this.modalConfig)
      throw new Error("Couldn't open the reset modal: no ModalConfig present.");

    this.modalService.openConfirm(this.modalConfig);
  }

  confirmResetTeam(p: Player): void {
    this.modalService.hide();
    this.doReset(p);
  }

  private async doReset(p: Player) {
    try {
      await firstValueFrom(this.teamService.get(p.teamId));
    }
    catch (err: any) {
      if (err.status == 400) {
        // we want to trap a 400 here per https://github.com/cmu-sei/Gameboard/issues/195,
        // so swallow if it matches and then redirect
        this.onSessionReset.emit(p);
        return;
      }
      else {
        this.errors.push(err);
      }
    }

    this.errors = [];
    this.isResetting = true;
    await firstValueFrom(this.teamService.resetSession({ teamId: p.teamId, resetType: "unenrollAndArchiveChallenges" }));
    delete p.session;
    this.onSessionReset.emit(p);
    this.player$.next(p);
    this.isResetting = false;
  }

  ngOnDestroy(): void {
    this.ctxSub?.unsubscribe();
  }
}
