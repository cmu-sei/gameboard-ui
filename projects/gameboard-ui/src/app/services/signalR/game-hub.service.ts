import { Injectable } from '@angular/core';
import { SignalRService } from './signalr.service';
import { ExternalGameCreationState, GameHubEvent, GameHubEventType, PlayerJoinedEvent } from './game-hub.models';
import { LogService } from '../log.service';
import { Subject } from 'rxjs';
import { SyncStartGameState, SyncStartGameStartedState } from '@/game/game.models';

@Injectable({ providedIn: 'root' })
export class GameHubService {
  private _externalGameLaunchStarted$ = new Subject<ExternalGameCreationState>();
  private _externalGameLaunchEnded$ = new Subject<ExternalGameCreationState>();
  private _externalGameLaunchFailure$ = new Subject<ExternalGameCreationState>();
  private _externalGameLaunchProgressChanged$ = new Subject<ExternalGameCreationState>();
  private _syncStartGameStateChanged$ = new Subject<SyncStartGameState>();
  private _syncStartGameStarted$ = new Subject<SyncStartGameStartedState>();
  private _joinedGameIds: string[] = [];

  public hubState$ = this.signalRService.state$;
  public externalGameLaunchProgressChanged$ = this._externalGameLaunchProgressChanged$.asObservable();
  public externalGameLaunchStarted$ = this._externalGameLaunchStarted$.asObservable();
  public externalGameLaunchEnded$ = this._externalGameLaunchEnded$.asObservable();
  public externalGameLaunchFailure$ = this._externalGameLaunchFailure$.asObservable();
  public syncStartGameStateChanged$ = this._syncStartGameStateChanged$.asObservable();
  public syncStartGameStarted$ = this._syncStartGameStarted$.asObservable();

  constructor(
    private logService: LogService,
    private signalRService: SignalRService<GameHubEvent<any>>) { }

  async joinGame(gameId: string) {
    await this.signalRService.connect(
      "hub/games",
      [
        { eventType: GameHubEventType.PlayerJoined, handler: ev => this.handleGameJoined.bind(this)(ev) },
        { eventType: GameHubEventType.ExternalGameChallengesDeployStart, handler: ev => this.handleExternalGameLaunchProgressChanged.bind(this)(ev) },
        { eventType: GameHubEventType.ExternalGameChallengesDeployProgressChange, handler: ev => this.handleExternalGameLaunchProgressChanged.bind(this)(ev) },
        { eventType: GameHubEventType.ExternalGameChallengesDeployEnd, handler: ev => this.handleExternalGameLaunchProgressChanged.bind(this)(ev) },
        { eventType: GameHubEventType.ExternalGameGamespacesDeployStart, handler: ev => this.handleExternalGameLaunchProgressChanged.bind(this)(ev) },
        { eventType: GameHubEventType.ExternalGameGamespacesDeployProgressChange, handler: ev => this.handleExternalGameLaunchProgressChanged.bind(this)(ev) },
        { eventType: GameHubEventType.ExternalGameGamespacesDeployEnd, handler: ev => this.handleExternalGameLaunchProgressChanged.bind(this)(ev) },
        { eventType: GameHubEventType.ExternalGameLaunchStart, handler: ev => this.handleExternalGameLaunchStarted.bind(this)(ev) },
        { eventType: GameHubEventType.ExternalGameLaunchFailure, handler: ev => this.handleExternalGameLaunchFailure.bind(this)(ev) },
        { eventType: GameHubEventType.ExternalGameLaunchEnd, handler: ev => this.handleExternalGameLaunchEnded.bind(this)(ev) },
        { eventType: GameHubEventType.SyncStartGameStateChanged, handler: ev => this.handleSyncStartStateChanged.bind(this)(ev) },
        { eventType: GameHubEventType.SyncStartGameStarting, handler: ev => this.handleSyncStartGameStarting.bind(this)(ev) },
        { eventType: GameHubEventType.YouJoined, handler: ev => this.logService.logInfo("joined!", ev) }
      ]);

    this.signalRService.sendMessage("JoinGame", { gameId });
    this._joinedGameIds.push(gameId);
  }

  async leaveGame(gameId: string) {
    if (this._joinedGameIds.indexOf(gameId) < 0) {
      this.logService.logInfo(`Attempted to leave gameId ${gameId}, but this player is not in the game's group.`);
      return;
    }

    await this.signalRService.sendMessage("LeaveGame", { gameId });
    this._joinedGameIds.filter(g => g !== gameId);
  }

  isConnectedToGame = (gameId: string) =>
    this._joinedGameIds.indexOf(gameId) >= 0;

  private handleGameJoined(ev: GameHubEvent<PlayerJoinedEvent>) {
    this.logService.logInfo("Joined (From the new game hub service)", ev);
  }

  private handleExternalGameLaunchStarted(ev: GameHubEvent<ExternalGameCreationState>) {
    this._externalGameLaunchStarted$.next(ev.data);
  }

  private handleExternalGameLaunchEnded(ev: GameHubEvent<ExternalGameCreationState>) {
    this._externalGameLaunchEnded$.next(ev.data);
  }

  private handleExternalGameLaunchFailure(ev: GameHubEvent<ExternalGameCreationState>) {
    this._externalGameLaunchFailure$.next(ev.data);
  }

  private handleExternalGameLaunchProgressChanged(ev: GameHubEvent<ExternalGameCreationState>) {
    this.logService.logInfo("progress updated", ev.data);
    this._externalGameLaunchProgressChanged$.next(ev.data);
  }

  private handleSyncStartStateChanged(ev: GameHubEvent<SyncStartGameState>) {
    this._syncStartGameStateChanged$.next(ev.data);
  }

  private handleSyncStartGameStarting(ev: GameHubEvent<SyncStartGameStartedState>) {
    this._syncStartGameStarted$.next(ev.data);
  }
}
