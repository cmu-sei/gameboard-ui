import { Injectable } from '@angular/core';
import { SignalRService } from './signalr.service';
import { NewGameHubEvent, PlayerJoinedEvent } from './game-hub.models';
import { LogService } from '../log.service';
import { Subject } from 'rxjs';
import { SyncStartGameState, SyncStartGameStartedState } from '@/game/game.models';

@Injectable({ providedIn: 'root' })
export class GameHubService {
  private _syncStartGameStateChanged$ = new Subject<SyncStartGameState>();
  private _syncStartGameStarted$ = new Subject<SyncStartGameStartedState>();
  private _joinedGameIds: string[] = [];

  public hubState$ = this.signalRService.state$;
  public syncStartGameStateChanged$ = this._syncStartGameStateChanged$.asObservable();
  public syncStartGameStarted$ = this._syncStartGameStarted$.asObservable();

  constructor(
    private logService: LogService,
    private signalRService: SignalRService<NewGameHubEvent<any>>) { }

  async joinGame(gameId: string) {
    await this.signalRService.connect(
      "hub/games",
      [
        { eventName: "playerJoined", handler: (ev) => this.handleGameJoined.bind(this) },
        { eventName: "syncStartGameStateChanged", handler: this.handleSyncStartStateChanged.bind(this) },
        { eventName: "syncStartGameStarting", handler: this.handleSyncStartGameStarting.bind(this) }
      ]);

    this.signalRService.sendMessage("JoinGame", { gameId });
    this._joinedGameIds.push(gameId);
  }

  async leaveGame(gameId: string) {
    if (this._joinedGameIds.indexOf(gameId) < 0) {
      this.logService.logWarning(`Attempted to leave gameId ${gameId}, but this player is not in the game's group.`);
    }

    await this.signalRService.sendMessage("LeaveGame", { gameId });
    this._joinedGameIds.filter(g => g !== gameId);
  }

  handleGameJoined(ev: NewGameHubEvent<PlayerJoinedEvent>) {
    this.logService.logInfo("Joined (From the new game hub service)", ev);
  }

  handleSyncStartStateChanged(ev: NewGameHubEvent<SyncStartGameState>) {
    this._syncStartGameStateChanged$.next(ev.data);
  }

  handleSyncStartGameStarting(ev: NewGameHubEvent<SyncStartGameStartedState>) {
    this._syncStartGameStarted$.next(ev.data);
  }
}
