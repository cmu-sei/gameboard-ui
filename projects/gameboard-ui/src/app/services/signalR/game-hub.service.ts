import { Injectable } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { SignalRService } from './signalr.service';
import { GameStartState, GameHubEvent, GameHubEventType, PlayerJoinedEvent, YouJoinedEvent, GameHubActiveEnrollment } from './game-hub.models';
import { LogService } from '@/services/log.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SyncStartGameState, SyncStartGameStartedState } from '@/game/game.models';
import { ConfigService } from '@/utility/config.service';
import { UserService } from '@/api/user.service';

@Injectable({ providedIn: 'root' })
export class GameHubService {
  private _activeEnrollments$ = new BehaviorSubject<GameHubActiveEnrollment[]>([]);

  private _externalGameLaunchStarted$ = new Subject<GameStartState>();
  private _externalGameLaunchEnded$ = new Subject<GameStartState>();
  private _externalGameLaunchFailure$ = new Subject<GameStartState>();
  private _externalGameLaunchProgressChanged$ = new Subject<GameStartState>();
  private _gameJoined$ = new Subject<PlayerJoinedEvent>();
  private _signalRService: SignalRService;
  private _syncStartGameStateChanged$ = new Subject<SyncStartGameState>();
  private _syncStartGameStarted$ = new Subject<SyncStartGameStartedState>();
  private _syncStartGameStarting$ = new Subject<SyncStartGameState>();
  private _youJoined$ = new Subject<YouJoinedEvent>();

  public activeEnrollments$ = this._activeEnrollments$.asObservable();
  public externalGameLaunchProgressChanged$ = this._externalGameLaunchProgressChanged$.asObservable();
  public externalGameLaunchStarted$ = this._externalGameLaunchStarted$.asObservable();
  public externalGameLaunchEnded$ = this._externalGameLaunchEnded$.asObservable();
  public externalGameLaunchFailure$ = this._externalGameLaunchFailure$.asObservable();
  public gameJoined$ = this._gameJoined$.asObservable();
  public hubState$: Observable<HubConnectionState>;
  public syncStartGameStateChanged$ = this._syncStartGameStateChanged$.asObservable();
  public syncStartGameStarted$ = this._syncStartGameStarted$.asObservable();
  public syncStartGameStarting$ = this._syncStartGameStarting$.asObservable();
  public youJoined$ = this._youJoined$.asObservable();

  constructor(
    configService: ConfigService,
    userService: UserService,
    private logService: LogService) {
    this._signalRService = new SignalRService(configService, logService, userService);
    this.hubState$ = this._signalRService.state$;
  }

  async disconnect() {
    await this._signalRService.disconnect();
  }

  isConnected() {
    return this._signalRService.isConnnected();
  }

  isConnectedToGame = (gameId: string) => {
    return this._signalRService.isConnnected() && this._activeEnrollments$.value.some(enrollment =>
      enrollment.game.id === gameId
    );
  };

  // This should _only_ be called once per login by the 
  // component which is managing all SignalR connections (GameboardSignalRHubsComponent)
  public async connect() {
    await this._signalRService.connect(
      "hub/games",
      [
        { eventType: GameHubEventType.ExternalGameChallengesDeployStart, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameChallengesDeployProgressChange, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameChallengesDeployEnd, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameGamespacesDeployStart, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameGamespacesDeployProgressChange, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameGamespacesDeployEnd, handler: this.handleExternalGameLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ExternalGameLaunchStart, handler: this.handleExternalGameLaunchStarted.bind(this) },
        { eventType: GameHubEventType.ExternalGameLaunchFailure, handler: this.handleExternalGameLaunchFailure.bind(this) },
        { eventType: GameHubEventType.ExternalGameLaunchEnd, handler: this.handleExternalGameLaunchEnded.bind(this) },
        { eventType: GameHubEventType.PlayerJoined, handler: this.handleGameJoined.bind(this) },
        { eventType: GameHubEventType.SyncStartGameStateChanged, handler: this.handleSyncStartStateChanged.bind(this) },
        { eventType: GameHubEventType.SyncStartGameStarted, handler: this.handleSyncStartGameStarted.bind(this) },
        { eventType: GameHubEventType.SyncStartGameStarting, handler: this.handleSyncStartGameStarting.bind(this) },
        { eventType: GameHubEventType.YouJoined, handler: this.handleYouJoined.bind(this) }
      ]);
  }

  private handleGameJoined(ev: GameHubEvent<PlayerJoinedEvent>) {
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

  private handleSyncStartGameStarted(ev: GameHubEvent<SyncStartGameStartedState>) {
    this._syncStartGameStarted$.next(ev.data);
  }

  private handleSyncStartGameStarting(ev: GameHubEvent<SyncStartGameState>) {
    this.logService.logInfo("Sync start game starting...", ev.data);
  }

  private handleYouJoined(ev: GameHubEvent<YouJoinedEvent>) {
    this.logService.logInfo("You joined the game hub!", ev.data);
    this._activeEnrollments$.next(ev.data.activeEnrollments.sort((a, b) => a.game.name.localeCompare(b.game.name)));
  }
}
