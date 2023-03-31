import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { GameService } from '../../../api/game.service';
import { GameContext } from '../../../api/models';
import { Player } from '../../../api/player-models';
import { PlayerService } from '../../../api/player.service';
import { FontAwesomeService } from '../../../services/font-awesome.service';
import { GameHubService } from '../../../services/signalR/game-hub.service';
import { SyncStartState } from '../../game.models';

@Component({
  selector: 'app-session-start-controls',
  templateUrl: './session-start-controls.component.html',
  styleUrls: ['./session-start-controls.component.scss']
})
export class SessionStartControlsComponent implements OnInit, OnDestroy {
  @Input() ctx!: GameContext;

  // TODO: ultimately pull these into this component
  @Output() onRequestDoubleCheck = new EventEmitter<boolean>();
  @Output() onRequestStart = new EventEmitter();

  protected isGameSyncStartReady = false;
  private gameHubSub?: Subscription;

  constructor(
    public faService: FontAwesomeService,
    private gameHub: GameHubService,
    private gameService: GameService,
    private playerService: PlayerService) { }

  ngOnInit(): void {
    this.gameService.getIsSyncStartReady(this.ctx.game.id).pipe(first()).subscribe(this.handleNewSyncStartState);
    this.gameHubSub = this.gameHub.syncStartChanged$.subscribe(stateUpdate => {
      this.handleNewSyncStartState(stateUpdate);
    });
  }

  ngOnDestroy(): void {
    this.gameHubSub?.unsubscribe();
  }

  protected handleDoubleCheckRequest(isDoubleChecking: boolean) {
    this.onRequestDoubleCheck.emit(isDoubleChecking);
  }

  protected handleStartRequest(player: Player) {
    this.onRequestStart.emit(player);
  }

  protected handleReadyUpdated(player: Player) {
    this.playerService.updateIsSyncStartReady(player.id, { isReady: player.isReady }).pipe(first()).subscribe();
  }

  private handleNewSyncStartState(state: SyncStartState) {
    this.isGameSyncStartReady = state.isReady;
    console.log("new sync start state", this.isGameSyncStartReady)
  }
}
