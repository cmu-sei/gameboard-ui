// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { BehaviorSubject, combineLatest, Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { AuthService, AuthTokenState } from '../utility/auth.service';
import { UserService } from '../api/user.service';
import { HubPlayer, Player, TimeWindow } from '../api/player-models';
import { LogService } from './log.service';
import { ExternalGameService } from './external-game.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private connection: HubConnection;

  private teamId$ = new Subject<string>();

  state$ = new BehaviorSubject<HubState>({ id: '', connectionState: HubConnectionState.Disconnected, joined: false });
  actors$ = new BehaviorSubject<Array<HubPlayer>>([]);
  announcements = new Subject<HubEvent>();
  teamEvents = new Subject<HubEvent>();
  challengeEvents = new Subject<HubEvent>();
  playerEvents = new Subject<HubEvent>();
  presenceEvents = new Subject<HubEvent>();
  ticketEvents = new Subject<HubEvent>();

  constructor(
    config: ConfigService,
    private auth: AuthService,
    private apiUserSvc: UserService,
    private externalGameService: ExternalGameService,
    private log: LogService,
  ) {
    this.connection = this.getConnection(`${config.apphost}hub`);

    // refresh connection on token refresh
    combineLatest([
      this.auth.tokenState$.pipe(
        debounceTime(250),
        distinctUntilChanged()
      ),
      this.teamId$
    ]).pipe(
      map(([token, id]) => ({ token, id }))
    ).subscribe(async ctx => {
      if (!ctx.id || ctx.token != AuthTokenState.valid) {
        await this.disconnect();
        return;
      }

      await this.maybeConnect(ctx.id);
    });
  }

  async init(groupId: string) {
    await this.maybeConnect(groupId);
    this.teamId$.next(groupId);
  }

  async initActors(teamId: string): Promise<void> {
    const previousActors = this.actors$.getValue();
    const currentActors: Array<HubPlayer> = [];

    if (!teamId || this.connection.state != HubConnectionState.Connected) {
      return;
    }

    const players: Player[] = await this.connection.invoke("ListTeam", teamId) as unknown as Player[];

    players.forEach(p => {
      currentActors.push({
        ...p,
        userApprovedName: p.approvedName,
        userName: p.name,
        pendingName: p.userName === p.userApprovedName ? p.userName : '',
        userNameStatus: p.nameStatus,
        session: p.sessionBegin && p.sessionEnd ? new TimeWindow(p.sessionBegin, p.sessionEnd) : undefined,
        sponsor: p.sponsor,
      });
    });

    // sort managers to the top for niceness
    currentActors.sort((a, b) => a.isManager ? -1 : 1);

    // did anything change?
    if (!this.areIdenticalPlayerArrays(previousActors, currentActors)) {
      this.actors$.next(currentActors);
    }
  }

  private async leaveChannel(): Promise<void> {
    const currentState = this.state$.getValue();
    if (!!currentState.id && currentState.connectionState === HubConnectionState.Connected) {
      await this.connection.invoke('Leave');

      this.postState({
        id: '',
        joined: false
      });
    }
  }

  private getConnection(url: string): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => this.apiUserSvc.ticket().pipe(map(result => result.ticket)).toPromise(),
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      } as IHttpConnectionOptions)
      .withAutomaticReconnect([1000, 2000, 3000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000])
      .configureLogging(LogLevel.Information)
      .build();

    connection.onclose(err => this.setDisconnected());
    connection.onreconnecting(err => this.setDisconnected());
    connection.onreconnected(cid => this.onReconnected());

    connection.on('teamEvent', (e: HubEvent) => this.onTeamEvent(e));
    connection.on('challengeEvent', (e: HubEvent) => this.challengeEvents.next(e));
    connection.on('announcement', (e: HubEvent) => this.announcements.next(e));
    connection.on('ticketEvent', (e: HubEvent) => this.ticketEvents.next(e));
    connection.on('playerEvent', e => this.onPlayerEvent(e));

    return connection;
  }

  private async maybeConnect(groupId: string) {
    try {
      // if we don't have a groupId, we can't do much
      if (!groupId) {
        return;
      }

      // if we're already connected...
      if (this.connection.state === HubConnectionState.Connected) {
        // and we're connected to the right group, do nothing
        if (this.state$.value?.id == groupId) {
          this.log.logInfo(`Team (notification) hub is already connected to team ${groupId}.`);
          return;
        }

        // if we're connected to the wrong group, disconnect and then try again
        await this.disconnect();
        await this.maybeConnect(groupId);
      }
      // if we're not already connected...
      else {
        // connect and then wait to make sure we get a real connection
        await this.resolveOpenConnection(groupId, this.connection);

        // connect to channel and read group
        await this.connection.invoke('Listen', groupId);
        this.postState({
          id: groupId,
          joined: true
        });

        await this.initActors(groupId);
      }
    } catch (e) {
      if (this.connection.state !== HubConnectionState.Connected) {
        this.log.logError(`Couldn't connect to the hub on group ${groupId}. State → `, this.state$.getValue());
      }
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.connection?.state === HubConnectionState.Connected) {
        await this.leaveChannel();
        await this.connection.stop();
        this.setDisconnected();

        this.postState({
          id: '',
          joined: false
        });
      }
    }
    catch (err) {
      this.log.logError("Error on SignalR disconnect:", err);
    }
  }

  public async sendMessage<T>(message: string, ...args: any[]): Promise<T> {
    if (this.connection.state !== HubConnectionState.Connected) {
      this.log.logError(`Can't invoke message ${message} - the hub is in a non-connected state (${this.connection.state})`);
    }

    try {
      return await this.connection.invoke(message, ...args);
    }
    catch (ex) {
      this.log.logError("Error on message send:", message, args, ex);
      throw ex;
    }
  }

  private async onReconnected(): Promise<void> {
    const currentState = this.state$.getValue();

    if (currentState.id) {
      await this.maybeConnect(currentState.id);
    }

    this.postState({
      id: currentState.id,
      joined: true,
    });
  }

  private setDisconnected(): void {
    this.actors$.next([]);
    this.postState({
      id: '',
      joined: false
    });
  }

  private postState(stateUpdate: { id?: string, joined?: boolean }): void {
    const currentState = this.state$.getValue();
    const finalStateUpdate = {
      id: stateUpdate.id || currentState?.id,
      joined: stateUpdate.joined || currentState.joined,
      connectionState: this.connection.state
    };

    this.state$.next({
      id: finalStateUpdate.connectionState == HubConnectionState.Connected ? finalStateUpdate.id || "" : "",
      joined: this.connection.state === HubConnectionState.Connected,
      connectionState: this.connection.state,
    });
  }

  private async onPlayerEvent(e: HubEvent): Promise<void> {
    await this.maybeUpdateTeammates(e.model.teamId, e.action);
    this.playerEvents.next(e);
    this.postState({});
  }

  private async onTeamEvent(e: HubEvent): Promise<void> {
    await this.maybeUpdateTeammates(e.model.id, e.action);
    this.teamEvents.next(e);
    this.postState({});
  }

  private areIdenticalPlayerArrays(previous: HubPlayer[], current: HubPlayer[]) {
    const previousIds = previous.map(p => p.id);
    const currentIds = current.map(p => p.id);

    previousIds.sort();
    currentIds.sort();

    if (previousIds.length !== currentIds.length) {
      return false;
    }

    for (let i = 0; i < previousIds.length; i++) {
      if (
        previous[i] != current[i]
        || previous[i].isManager != current[i].isManager
        || !!previous[i].session != !!current[i].session) {
        return false;
      }
    }

    return true;
  }

  private async maybeUpdateTeammates(teamId: string, action: HubEventAction) {
    if (
      action === HubEventAction.arrived ||
      action === HubEventAction.departed ||
      action === HubEventAction.created ||
      action === HubEventAction.roleChanged ||
      action === HubEventAction.updated) {
      await this.initActors(teamId);
    }
  }

  private maybeClearExternalGameLocalStorage(teamId: string, action: HubEventAction) {
    if (action === HubEventAction.sessionReset) {
      this.externalGameService.clearLocalStorageKeys(teamId);
    }
  }

  private async resolveOpenConnection(channelId: string, connection: HubConnection, attemptCount = 0, maxAttempts = 5): Promise<void> {
    if (attemptCount >= maxAttempts) {
      throw new Error("Couldn't connect to the SignalR hub.");
    }

    await this.connection.start();
    if (connection.state === HubConnectionState.Connected) {
      return;
    }

    const attemptIntervals = [2000, 3000, 3000, 5000, 10000];
    await timer(attemptIntervals[attemptCount]).toPromise();

    return await this.resolveOpenConnection(channelId, connection, attemptCount + 1);
  }
}

export interface HubState {
  id: string;
  connectionState: HubConnectionState;
  joined: boolean;
}

export interface HubEvent {
  action: HubEventAction;
  actingUser: { id: string, name: string };
  model: any;
}

export interface Actor {
  id: string;
  userName: string;
  userApprovedName: string;
  userNameStatus: string;
  sponsor: string;
  sponsorLogo: string;
  isManager: boolean;
  pendingName: string;
  online: boolean;
}

export enum HubEventAction {
  arrived = 'arrived',
  departed = 'departed',
  created = 'created',
  updated = 'updated',
  deleted = 'deleted',
  sessionExtended = 'sessionExtended',
  sessionReset = 'sessionReset',
  started = 'started',
  roleChanged = 'roleChanged',
  waiting = 'waiting'
}
