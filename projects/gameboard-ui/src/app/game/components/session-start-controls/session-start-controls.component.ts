import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { GameService } from '../../../api/game.service';
import { GameContext } from '../../../api/game-models';
import { Player } from '../../../api/player-models';
import { PlayerService } from '../../../api/player.service';
import { FontAwesomeService } from '../../../services/font-awesome.service';
import { GameHubService } from '../../../services/signalR/game-hub.service';
import { SyncStartService } from '../../../services/sync-start.service';
import { SyncStartState } from '../../game.models';

@Component({
  selector: 'app-session-start-controls',
  templateUrl: './session-start-controls.component.html',
  styleUrls: ['./session-start-controls.component.scss']
})
export class SessionStartControlsComponent implements OnInit, OnDestroy {
  @Input() ctx!: GameContext;

  // TODO: ultimately pull these into this component
  @Output() onDoubleCheckChanged = new EventEmitter<boolean>();
  @Output() onRequestStart = new EventEmitter();

  private gameHubSub?: Subscription;

  protected START_DISABLED_TOOLTIP = "We're still waiting for all registered players to ready up. Once they do, you can start your session.";
  protected isDoubleChecking = false;
  protected isGameSyncStartReady = false;
  protected playerReadyCount = 0;
  protected playerNotReadyCount = 0;
  protected playerReadyPct = 0;

  constructor(
    public faService: FontAwesomeService,
    private gameHub: GameHubService,
    private gameService: GameService,
    private playerService: PlayerService,
    private syncStartService: SyncStartService) { }

  ngOnInit(): void {
    if (this.ctx.game.requireSynchronizedStart) {
      this.gameService.getSyncStartState(this.ctx.game.id).pipe(first()).subscribe(this.handleNewSyncStartState);
      this.gameHubSub = this.gameHub.syncStartChanged$.subscribe(stateUpdate => {
        this.handleNewSyncStartState(stateUpdate);
      });
    }
  }

  ngOnDestroy(): void {
    this.gameHubSub?.unsubscribe();
  }

  protected handleDoubleCheckRequest(isDoubleChecking: boolean) {
    this.isDoubleChecking = isDoubleChecking;
    this.onDoubleCheckChanged.emit(isDoubleChecking);
  }

  protected handleStartRequest(player: Player) {
    this.onRequestStart.emit(player);
  }

  protected handleReadyUpdated(player: Player) {
    this.playerService.updateIsSyncStartReady(player.id, { isReady: player.isReady }).pipe(first()).subscribe();
  }

  private handleNewSyncStartState(state: SyncStartState) {
    this.isGameSyncStartReady = state.isReady;

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
