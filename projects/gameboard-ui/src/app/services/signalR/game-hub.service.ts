// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { SignalRService } from './signalr.service';
import { GameHubEventWith, GameHubEventType, GameHubActiveEnrollment, GameHubResourcesDeployStatus } from './game-hub.models';
import { LogService } from '@/services/log.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SyncStartGameState, SyncStartGameStartedState } from '@/game/game.models';
import { ConfigService } from '@/utility/config.service';
import { UserService } from '@/api/user.service';

@Injectable({ providedIn: 'root' })
export class GameHubService {
  private _signalRService: SignalRService;

  private _activeEnrollments$ = new BehaviorSubject<GameHubActiveEnrollment[]>([]);
  private _launchStarted$ = new Subject<GameHubEventWith<GameHubResourcesDeployStatus>>();
  private _launchEnded$ = new Subject<GameHubEventWith<GameHubResourcesDeployStatus>>();
  private _launchFailure$ = new Subject<GameHubEventWith<{ message: string }>>();
  private _launchProgressChanged$ = new Subject<GameHubEventWith<GameHubResourcesDeployStatus>>();
  private _syncStartGameStateChanged$ = new Subject<SyncStartGameState>();
  private _syncStartGameStarted$ = new Subject<SyncStartGameStartedState>();
  private _syncStartGameStarting$ = new Subject<SyncStartGameState>();

  public activeEnrollments$ = this._activeEnrollments$.asObservable();
  public launchProgressChanged$ = this._launchProgressChanged$.asObservable();
  public launchStarted$ = this._launchStarted$.asObservable();
  public launchEnded$ = this._launchEnded$.asObservable();
  public launchFailure$ = this._launchFailure$.asObservable();
  public hubState$: Observable<HubConnectionState>;
  public syncStartGameStateChanged$ = this._syncStartGameStateChanged$.asObservable();
  public syncStartGameStarted$ = this._syncStartGameStarted$.asObservable();
  public syncStartGameStarting$ = this._syncStartGameStarting$.asObservable();

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

  isConnectedToGame = (gameId: string) => {
    return this._signalRService.connectionState == HubConnectionState.Connected;
  };

  // This should _only_ be called once per login by the 
  // component which is managing all SignalR connections (GameboardSignalRHubsComponent)
  public async connect() {
    await this._signalRService.connect(
      "hub/games",
      [
        { eventType: GameHubEventType.ChallengesDeployStart, handler: this.handleLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ChallengesDeployProgressChange, handler: this.handleLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.ChallengesDeployEnd, handler: this.handleLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.GamespacesDeployStart, handler: this.handleLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.GamespacesDeployProgressChange, handler: this.handleLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.GamespacesDeployEnd, handler: this.handleLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.LaunchStart, handler: this.handleLaunchStart.bind(this) },
        { eventType: GameHubEventType.LaunchEnd, handler: this.handleLaunchEnded.bind(this) },
        { eventType: GameHubEventType.LaunchFailure, handler: this.handleLaunchFailure.bind(this) },
        { eventType: GameHubEventType.LaunchProgressChanged, handler: this.handleLaunchProgressChanged.bind(this) },
        { eventType: GameHubEventType.SyncStartGameStateChanged, handler: this.handleSyncStartStateChanged.bind(this) },
        { eventType: GameHubEventType.SyncStartGameStarted, handler: this.handleSyncStartGameStarted.bind(this) },
        { eventType: GameHubEventType.SyncStartGameStarting, handler: this.handleSyncStartGameStarting.bind(this) },
      ]);
  }

  private handleLaunchStart(ev: GameHubEventWith<GameHubResourcesDeployStatus>) {
    this._launchStarted$.next(ev);
  }

  private handleLaunchEnded(ev: GameHubEventWith<GameHubResourcesDeployStatus>) {
    this._launchEnded$.next(ev);
  }

  private handleLaunchFailure(ev: GameHubEventWith<{ message: string; }>) {
    this._launchFailure$.next(ev);
  }

  private handleLaunchProgressChanged(ev: GameHubEventWith<GameHubResourcesDeployStatus>) {
    this._launchProgressChanged$.next(ev);
  }

  private handleSyncStartStateChanged(ev: GameHubEventWith<SyncStartGameState>) {
    this.logService.logInfo("Sync start state changed:", ev.data);
    this._syncStartGameStateChanged$.next(ev.data);
  }

  private handleSyncStartGameStarted(ev: GameHubEventWith<SyncStartGameStartedState>) {
    this._syncStartGameStarted$.next(ev.data);
  }

  private handleSyncStartGameStarting(ev: GameHubEventWith<SyncStartGameState>) {
    this.logService.logInfo("Sync start game starting...", ev.data);
  }
}
