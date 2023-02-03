// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { BehaviorSubject, combineLatest, Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map, take } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { AuthService, AuthTokenState } from './auth.service';
import { UserService } from '../api/user.service';
import { Player } from '../api/player-models';
import { UserService as CurrentUserService } from './user.service';
import { LogService } from '../services/log.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  public connection: HubConnection;
  private hubState: HubState = { id: '', connected: false, joined: false, actors: [] };
  private teamId$ = new BehaviorSubject<string>("");
  private userId: string | null = null;

  state$ = new BehaviorSubject<HubState>(this.hubState);
  announcements = new Subject<HubEvent>();
  presenceEvents = new Subject<HubEvent>();
  teamEvents = new Subject<HubEvent>();
  challengeEvents = new Subject<HubEvent>();
  ticketEvents = new Subject<HubEvent>();

  constructor(
    private config: ConfigService,
    private auth: AuthService,
    private apiUserSvc: UserService,
    private userSvc: CurrentUserService,
    private log: LogService
  ) {

    this.connection = this.getConnection(`${config.apphost}hub`);
    this.userSvc.user$.pipe(first()).subscribe(u => this.userId = u?.id || null);

    // refresh connection on token refresh
    const authtoken$ = this.auth.tokenState$.pipe(
      debounceTime(250),
      distinctUntilChanged()
    );

    combineLatest([authtoken$, this.teamId$]).pipe(
      map(([token, id]) => ({ token, id }))
    ).subscribe(async ctx => {
      if (!ctx.id || ctx.token != AuthTokenState.valid) {
        this.disconnect();
        return;
      }

      if (ctx.id != this.hubState.id) {
        await this.joinChannel(ctx.id);
        this.hubState.id = ctx.id;
      }
    });
  }

  async init(id: string, preserveExisting?: boolean): Promise<void> {
    if (preserveExisting && this.hubState.connected) { return; }

    if (!this.hubState.connected) {
      await this.connect();
    }

    this.teamId$.next(id);
    return
  }

  async initActors(teamId: string): Promise<void> {
    const players: Player[] = await this.connection.invoke("ListTeam", teamId) as unknown as Player[];
    const actors: Actor[] = [];

    players.forEach(p => {
      actors.push({
        ...p,
        userApprovedName: p.approvedName,
        userName: p.name,
        pendingName: p.userName === p.userApprovedName ? p.userName : '',
        playerId: p.id,
        userNameStatus: p.nameStatus,
        // TODO: this was always true previously
        online: true,
        sponsorLogo: p.sponsor ?
          `${this.config.imagehost}/${p.sponsor}`
          : `${this.config.basehref}assets/sponsor.svg`
      });
    });

    this.postState(state => state.actors = actors);
  }

  private async joinChannel(id: string): Promise<void> {
    // prevent race if trying to join channel before connection is fully up
    if (this.connection.state !== HubConnectionState.Connected) {
      timer(1000).subscribe(() => this.joinChannel(id));
      return;
    }

    try {
      await this.leaveChannel();
      if (!!id) {
        try {
          await this.connection.invoke("Listen", id);
        }
        catch (listenErr) {
          this.log.logError("Error on calling \"Listen\" on the team hub: ", listenErr);
        }

        this.hubState.id = id;
        this.hubState.joined = true;

        await this.initActors(id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  private async leaveChannel(): Promise<void> {
    if (!!this.hubState.id && this.connection.state === HubConnectionState.Connected) {
      await this.connection.invoke('Leave');
      this.hubState.id = '';
      this.hubState.joined = false;
      this.hubState.actors = [];

      this.postState(state => {
        state.id = '';
        state.joined = false;
        state.actors = [];
      });
    }
  }

  private getConnection(url: string): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => this.getTicket(),
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      } as IHttpConnectionOptions)
      .withAutomaticReconnect([1000, 2000, 3000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000])
      .configureLogging(LogLevel.Information)
      .build();

    connection.onclose(err => this.setDisconnected());
    connection.onreconnecting(err => this.setDisconnected());
    connection.onreconnected(cid => this.setConnected());

    connection.on('presenceEvent', (event: HubEvent) => {
      if (event.action === HubEventAction.arrived && event.model?.id != this.userId) {
        this.connection.invoke("Greet");
      }

      this.initActors(this.hubState.id);
      this.presenceEvents.next(event);
    });

    connection.on('teamEvent', (e: HubEvent) => this.teamEvents.next(e));
    connection.on('challengeEvent', (e: HubEvent) => this.challengeEvents.next(e));
    connection.on('announcement', (e: HubEvent) => this.announcements.next(e));
    connection.on('ticketEvent', (e: HubEvent) => this.ticketEvents.next(e));

    return connection;
  }

  private async getTicket(): Promise<string> {
    return this.apiUserSvc.ticket().pipe(
      map(result => result.ticket)
    ).toPromise();
  }

  private async connect(): Promise<void> {
    try {
      await this.connection.start();
      await this.setConnected();
      this.connection.invoke("Greet");
    } catch (e) {
      timer(5000).subscribe(() => this.connect());
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.connection?.state === HubConnectionState.Connected) {
        await this.connection.stop();
        this.setDisconnected();
      }
    } finally { }
  }

  private async setConnected(): Promise<void> {
    this.postState(state => {
      state.connected = true;
    });

    if (this.hubState.id) {
      await this.joinChannel(this.hubState.id); // rejoin if was previously joined
    }
  }

  private setDisconnected(): void {
    this.postState(state => {
      state.connected = false;
      state.joined = false;
      state.actors = [];
    });
  }

  private postState(buildAction: (state: HubState) => void): void {
    const currentState = this.state$.getValue();
    buildAction(currentState);
    this.state$.next(currentState);
  }

  // private addToHereIfNotPresent(playerId: string) {
  //   if (this.playersHere.indexOf(playerId) == -1) {
  //     this.playersHere.push(playerId);
  //   }
  // }

  // private removeFromHereIfPresent(playerId: string) {
  //   const playerIndex = this.playersHere.indexOf(playerId);
  //   if (playerIndex >= 0) {
  //     this.playersHere.splice(playerIndex, 1);
  //   }
  // }
}

export interface HubState {
  id: string;
  connected: boolean;
  joined: boolean;
  actors: Actor[];
}

export interface HubEvent {
  action: HubEventAction;
  model?: any;
}

export interface Actor {
  id: string;
  playerId: string;
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
  greeted = 'greeted',
  departed = 'departed',
  created = 'created',
  updated = 'updated',
  deleted = 'deleted',
  started = 'started'
}
