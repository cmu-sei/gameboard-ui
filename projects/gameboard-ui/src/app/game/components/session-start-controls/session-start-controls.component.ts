// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GameService } from '../../../api/game.service';
import { GameContext } from '../../../api/game-models';
import { Player } from '../../../api/player-models';
import { fa } from '@/services/font-awesome.service';
import { SyncStartService } from '@/services/sync-start.service';
import { SyncStartGameState } from '@/game/game.models';
import { GameHubService } from '@/services/signalR/game-hub.service';
import { LogService } from '@/services/log.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { HubConnectionState } from '@microsoft/signalr';

@Component({
  selector: 'app-session-start-controls',
  templateUrl: './session-start-controls.component.html',
  styleUrls: ['./session-start-controls.component.scss'],
  providers: [UnsubscriberService],
  standalone: false
})
export class SessionStartControlsComponent implements OnInit {
  @Input() ctx!: GameContext;

  // TODO: ultimately pull these into this component
  @Output() onDoubleCheckChanged = new EventEmitter<boolean>();
  @Output() onRequestStart = new EventEmitter();

  protected fa = fa;
  protected isDoubleChecking = false;
  protected isGameSyncStartReady = false;
  protected isConnectedToGameHub = false;
  protected isHubConnectionError = false;
  protected isReadyingUp = false;
  protected isStartingSession = false;
  protected playerReadyCount = 0;
  protected playerNotReadyCount = 0;
  protected playerReadyPct = 0;

  constructor(
    private gameHub: GameHubService,
    private gameService: GameService,
    private logService: LogService,
    private syncStartService: SyncStartService,
    private unsub: UnsubscriberService) { }

  async ngOnInit(): Promise<void> {
    if (this.ctx.game.requireSynchronizedStart) {
      // update stuff state of the game hub on init
      this.handleNewSyncStartState(await firstValueFrom(this.gameService.getSyncStartState(this.ctx.game.id)));

      // when the hub updates, maintain state
      this.unsub.add(
        this.gameHub.activeEnrollments$.subscribe(() => this.isConnectedToGameHub = this.gameHub.isConnectedToGame(this.ctx.game.id)),
        this.gameHub.hubState$.subscribe(state => {
          this.isConnectedToGameHub = this.gameHub.isConnectedToGame(this.ctx.game.id);
          this.isHubConnectionError = (state === HubConnectionState.Disconnected || state === HubConnectionState.Disconnecting);
        }),

        this.gameHub.syncStartGameStateChanged$.subscribe(stateUpdate => {
          if (stateUpdate.game.id === this.ctx.game.id) {
            this.logService.logInfo("State update", stateUpdate);
            this.handleNewSyncStartState(stateUpdate);
          }
        }),
      );
    }
  }

  protected handleDoubleCheckRequest(isDoubleChecking: boolean) {
    this.isDoubleChecking = isDoubleChecking;
    this.onDoubleCheckChanged.emit(isDoubleChecking);
  }

  protected async handleStartRequest(player: Player) {
    this.isStartingSession = true;
    try {
      this.onRequestStart.emit(player);
    }
    finally {
      this.isStartingSession = false;
    }
  }

  protected async handleReadyUpdated(player: Player) {
    this.isReadyingUp = true;
    player.isReady = !player.isReady;
    this.logService.logInfo(`Player ${player.id} (user ${player.userId}) updating ready (${player.isReady})...`);
    await firstValueFrom(this.syncStartService.updatePlayerReadyState(player.id, { isReady: player.isReady }));
    this.logService.logInfo(`Player ${player.id} (user ${player.userId}) is now ${player.isReady ? "" : "NOT "}ready.`);
    this.isReadyingUp = false;
  }

  private handleNewSyncStartState(state: SyncStartGameState) {
    this.isGameSyncStartReady = state.isReady;
    this.ctx.player.isReady = state.teams.some(t => t.players.some(p => p.isReady && p.id === this.ctx.player.id));

    if (!state || !state.teams.length) {
      this.playerReadyPct = 0;
    }

    // get player ready/notready counts
    this.playerReadyCount = this.syncStartService.getReadyPlayers(state).length;
    this.playerNotReadyCount = this.syncStartService.getNotReadyPlayers(state).length;

    if (this.playerNotReadyCount + this.playerReadyCount > 0) {
      this.playerReadyPct = Math.round(100 * (this.playerReadyCount * 1.0) / (this.playerReadyCount + this.playerNotReadyCount));
    } else {
      this.playerReadyPct = 0;
    }
  }
}
