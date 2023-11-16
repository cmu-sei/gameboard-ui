import { Inject, Injectable } from '@angular/core';
import { SignalRService } from './signalr.service';
import { GameStartState, GameHubEvent, GameHubEventType, PlayerJoinedEvent } from './game-hub.models';
import { LogService } from '@/services/log.service';
import { BehaviorSubject, Subject, tap } from 'rxjs';
import { SyncStartGameState, SyncStartGameStartedState } from '@/game/game.models';

@Injectable({ providedIn: 'root' })
export class GameHubService {
  private _externalGameLaunchStarted$ = new Subject<GameStartState>();
  private _externalGameLaunchEnded$ = new Subject<GameStartState>();
  private _externalGameLaunchFailure$ = new Subject<GameStartState>();
  private _externalGameLaunchProgressChanged$ = new Subject<GameStartState>();
  private _gameJoined$ = new Subject<PlayerJoinedEvent>();
  private _joinedGameIds$ = new BehaviorSubject<string[]>([]);
  private _syncStartGameStateChanged$ = new Subject<SyncStartGameState>();
  private _syncStartGameStarted$ = new Subject<SyncStartGameStartedState>();

  public externalGameLaunchProgressChanged$ = this._externalGameLaunchProgressChanged$.asObservable();
  public externalGameLaunchStarted$ = this._externalGameLaunchStarted$.asObservable();
  public externalGameLaunchEnded$ = this._externalGameLaunchEnded$.asObservable();
  public externalGameLaunchFailure$ = this._externalGameLaunchFailure$.asObservable();
  public gameJoined$ = this._gameJoined$.asObservable();
  public hubState$ = this.signalRService.state$;
  public joinedGameIds$ = this._joinedGameIds$.asObservable();
  public syncStartGameStateChanged$ = this._syncStartGameStateChanged$.asObservable();
  public syncStartGameStarted$ = this._syncStartGameStarted$.asObservable();

  constructor(
    private logService: LogService,
    @Inject(SignalRService) private signalRService: SignalRService) { }

  async disconnect() {
    await this.signalRService.disconnect();
  }

  async joinGame(gameId: string) {
    if (!gameId) {
      this.logService.logError("Can't join game with falsey id", gameId);
    }

    if (this._joinedGameIds$.value.some(gId => gId == gameId)) {
      this.logService.logWarning(`Tried to join ${gameId} but was already connected.`, this.signalRService.connectionState);
      return;
    }

    this.logService.logInfo(`Game hub is joining game ${gameId}...`);
    this.signalRService.sendMessage("JoinGame", { gameId });
    this._joinedGameIds$.next([...this._joinedGameIds$.value, gameId]);
  }

  async leaveGame(gameId: string) {
    if (!this._joinedGameIds$.value.some(gId => gId == gameId)) {
      this.logService.logInfo(`Attempted to leave gameId ${gameId}, but this player is not in the game's group.`);
      return;
    }

    await this.signalRService.sendMessage("LeaveGame", { gameId });
    this._joinedGameIds$.next(this._joinedGameIds$.value.filter(g => g !== gameId));
  }

  isConnected() {
    return this.signalRService.isConnnected();
  }

  isConnectedToGame = (gameId: string) => {
    return this.signalRService.isConnnected() && this._joinedGameIds$.value.some(gId => gId === gameId);
  };

  // This should _only_ be called once per login by the 
  // component which is managing all SignalR connections (GameboardSignalRHubsComponent)
  public async connect() {
    await this.signalRService.connect(
      "hub/games",
      [
        { eventType: GameHubEventType.PlayerJoined, handler: this.handleGameJoined.bind(this) },
        { eventType: GameHubEventType.ExternalGameChallengesDeployStart, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameChallengesDeployProgressChange, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameChallengesDeployEnd, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameGamespacesDeployStart, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameGamespacesDeployProgressChange, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameGamespacesDeployEnd, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameLaunchStart, handler: this.handleExternalGameLaunchStarted.bind(this) },
        { eventType: GameHubEventType.ExternalGameLaunchFailure, handler: this.handleExternalGameLaunchFailure.bind(this) },
        { eventType: GameHubEventType.ExternalGameLaunchEnd, handler: this.handleExternalGameLaunchEnded.bind(this) },
        { eventType: GameHubEventType.SyncStartGameStateChanged, handler: this.handleSyncStartStateChanged.bind(this) },
        { eventType: GameHubEventType.SyncStartGameStarting, handler: this.handleSyncStartGameStarting.bind(this) },
        { eventType: GameHubEventType.YouJoined, handler: ev => this.handleGameJoined.bind(this) }
      ]);
  }

  private handleGameJoined(ev: GameHubEvent<PlayerJoinedEvent>) {
    this.logService.logInfo("Joined the game", ev);
    this._gameJoined$.next(ev.data);
  }

  private handleExternalGameLaunchStarted(ev: GameHubEvent<GameStartState>) {
    this._externalGameLaunchStarted$.next(ev.data);
  }

  private handleExternalGameLaunchEnded(ev: GameHubEvent<GameStartState>) {
    this._externalGameLaunchEnded$.next(ev.data);
  }

  private handleExternalGameLaunchFailure(ev: GameHubEvent<GameStartState>) {
    this._externalGameLaunchFailure$.next(ev.data);
  }

  private handleExternalGameLaunchProgressChanged(ev: GameHubEvent<GameStartState>) {
    this._externalGameLaunchProgressChanged$.next(ev.data);
  }

  private handleSyncStartStateChanged(ev: GameHubEvent<SyncStartGameState>) {
    this.logService.logInfo("Sync start state changed:", ev.data);
    this._syncStartGameStateChanged$.next(ev.data);
  }

  private handleSyncStartGameStarting(ev: GameHubEvent<SyncStartGameStartedState>) {
    this._syncStartGameStarted$.next(ev.data);
  }
}
