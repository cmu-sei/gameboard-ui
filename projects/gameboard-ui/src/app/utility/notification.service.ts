// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Inject, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { BehaviorSubject, combineLatest, Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { AuthService, AuthTokenState } from './auth.service';
import { UserService } from '../api/user.service';
import { Player } from '../api/player-models';
import { UserService as CurrentUserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  public connection: HubConnection;
  private hubState: HubState = { id: '', initialized: false, connected: false, joined: false, actors: [] };
  private teamId$ = new Subject<string>();
  private userId: string | null = null;

  state$ = new BehaviorSubject<HubState>(this.hubState);
  announcements = new Subject<HubEvent>();
  presenceEvents = new Subject<HubEvent>();
  teamEvents = new Subject<HubEvent>();
  challengeEvents = new Subject<HubEvent>();
  ticketEvents = new Subject<HubEvent>();

  private playersHere: string[] = [];

  constructor (
    private config: ConfigService,
    private auth: AuthService,
    private apiUserSvc: UserService,
    private userSvc: CurrentUserService
  ) {

    this.connection = this.getConnection(`${config.apphost}hub`);
    this.userSvc.user$.pipe(take(1)).subscribe(u => this.userId = u?.id || null);

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

    console.log("HUBCONNECT: connecting to hub", id);
    this.teamId$.next(id);
  }

  async initActors(teamId: string): Promise<void> {
    const players: Player[] = await this.connection.invoke("ListTeam", teamId) as unknown as Player[];
    this.hubState.actors = [];

    players.forEach(p => {
      this.addToHereIfNotPresent(p.id);

      this.hubState.actors.push({
        ...p,
        userApprovedName: p.approvedName,
        userName: p.name,
        pendingName: p.userName === p.userApprovedName ? p.userName : '',
        userNameStatus: p.nameStatus,
        online: p.userId == this.userId || this.playersHere.indexOf(p.id) >= 0,
        sponsorLogo: p.sponsor ?
          `${this.config.imagehost}/${p.sponsor}`
          : `${this.config.basehref}assets/sponsor.svg`
      })
    });



    this.postState();
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
        await this.connection.invoke('Listen', id);
        this.hubState.id = id;
        this.hubState.joined = true;
        console.log("HUBCONNECT: joined channel", id);

        await this.initActors(id);
        this.postState();
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
      this.postState();
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

      if (event.action === HubEventAction.arrived || event.action === HubEventAction.greeted) {
        if (event.model?.playerId) {
          this.addToHereIfNotPresent(event.model?.playerId);
        }
      }
      else if (event.action == HubEventAction.departed || event.action == HubEventAction.deleted) {
        if (event.model?.playerId) {
          this.removeFromHereIfPresent(event.model.playerId);
        }
      }

      this.initActors(this.hubState.id);
      this.presenceEvents.next(event);
      this.postState()
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

  private async disconnect(): Promise<void> {
    try {
      if (this.connection?.state === HubConnectionState.Connected) {
        await this.connection.stop();
        this.setDisconnected();
      }
    } finally { }
  }

  private async setConnected(): Promise<void> {
    this.hubState.connected = true;
    this.hubState.initialized = true;
    this.postState();
    if (this.hubState.id) {
      await this.joinChannel(this.hubState.id); // rejoin if was previously joined

    }
  }

  private setDisconnected(): void {
    this.hubState.connected = false;
    this.hubState.joined = false;
    this.hubState.actors = [];
    this.postState();
  }

  private postState(): void {
    this.state$.next(this.hubState);
  }

  private addToHereIfNotPresent(playerId: string) {
    if (this.playersHere.indexOf(playerId) == -1) {
      this.playersHere.push(playerId);
    }
  }

  private removeFromHereIfPresent(playerId: string) {
    const playerIndex = this.playersHere.indexOf(playerId);
    if (playerIndex >= 0) {
      this.playersHere.splice(playerIndex, 1);
    }
  }
}

export interface HubState {
  id: string;
  initialized: boolean;
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
