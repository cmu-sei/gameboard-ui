// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faBolt, faCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { interval, Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { GameContext } from '../../api/models';
import { Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ModalConfirmComponent } from '../../core/components/modal/modal-confirm.component';
import { ModalConfirmConfig } from '../../core/directives/modal-confirm.directive';
import { HubState } from '../../services/notification.service';

@Component({
  selector: 'app-player-session',
  templateUrl: './player-session.component.html',
  styleUrls: ['./player-session.component.scss']
})
export class PlayerSessionComponent {
  @Input() ctx$!: Observable<GameContext | undefined>;
  @Input() hubState$!: Observable<HubState>;
  @Output() onSessionStart = new EventEmitter<Player>();
  @Output() onSessionReset = new EventEmitter<Player>();

  errors: any[] = [];
  myCtx$!: Observable<GameContext | undefined>;
  doublechecking = false;

  // sets up the modal if it's a team game that needs confirmation
  private modalRef?: BsModalRef;
  protected modalConfig?: ModalConfirmConfig;

  faBolt = faBolt;
  faTrash = faTrash;
  faDot = faCircle;

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
  }

  handleStart(player: Player): void {
    this.api.start(player).pipe(
      first()
    ).subscribe(
      p => {
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
}
