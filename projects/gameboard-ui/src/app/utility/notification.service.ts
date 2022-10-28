// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { BehaviorSubject, combineLatest, Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { AuthService, AuthTokenState } from './auth.service';
import { UserService } from '../api/user.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private connection: HubConnection;
  private hubState: HubState = { id: '', initialized: false, connected: false, joined: false, actors: []};
  private playerId$ = new Subject<string>();
  private initialActors: Actor[] = [];

  state$ = new BehaviorSubject<HubState>(this.hubState);
  announcements = new Subject<HubEvent>();
  presenceEvents = new Subject<HubEvent>();
  teamEvents = new Subject<HubEvent>();
  challengeEvents = new Subject<HubEvent>();
  ticketEvents = new Subject<HubEvent>();

  constructor(
    private config: ConfigService,
    private auth: AuthService,
    private apiUserSvc: UserService
  ) {

    this.connection = this.getConnection(`${config.apphost}hub`);

    // refresh connection on token refresh
    const authtoken$ = this.auth.tokenState$.pipe(
      debounceTime(250),
      distinctUntilChanged()
    );

    combineLatest([authtoken$, this.playerId$]).pipe(
      map(([token, id]) => ({token, id}))
    ).subscribe(ctx => {
      this.hubState.id = ctx.id;
      this.disconnect();
      if (!!ctx.id && ctx.token === AuthTokenState.valid) {
        this.connect();
      }
    });

  }

  init(id: string, preserveExisting?: boolean): void {
    if (preserveExisting && this.hubState.connected) { return; }
    if (this.hubState?.id !== id) {
      this.playerId$.next(id);
    }
  }

  initActors(players: Actor[]): void {
    this.initialActors = players;
    players.forEach(p => {
      const actor = this.hubState.actors.find(a => a.id === p.id);
      if (!actor) {
        p.pendingName = p.userApprovedName !== p.userName
          ? p.userName
          : ''
        ;
        p.online = p.id === this.hubState.id;
        this.hubState.actors.push(p as Actor);
      }
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
        this.postState();
        this.initActors(this.initialActors);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private async leaveChannel(): Promise<void> {
    if (!!this.hubState.id && this.connection.state === HubConnectionState.Connected) {
      await this.connection.invoke('Leave');
      this.hubState.id = '';
      this.hubState.joined = false;
      this.hubState.actors = [];
      // this.initialActors = [];
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
      if (event.action === HubEventAction.arrived) {
          connection.invoke('Greet');
      }
      this.presenceEvents.next(event);
      this.updatePresence(event);
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
    } finally {}
  }

  private async setConnected(): Promise<void> {
    this.hubState.connected = true;
    this.hubState.initialized = true;
    this.postState();
    if (this.hubState.id){
      await this.joinChannel(this.hubState.id); // rejoin if was previously joined
    }
  }

  private setDisconnected(): void {
    this.hubState.connected = false;
    this.hubState.joined = false;
    this.hubState.actors = [];
    this.postState();
  }

  private updatePresence(event: HubEvent): void {

    let actor = this.hubState.actors.find(a => a.id === event.model.id)
      ?? {...event.model} as Actor
    ;

    actor.userName = event.model.userName;
    actor.userApprovedName = event.model.userApprovedName;
    actor.userNameStatus  = event.model.userNameStatus;
    actor.sponsor = event.model.sponsor;

    actor.online = (
      event.action === HubEventAction.arrived ||
      event.action === HubEventAction.greeted
    );

    actor.sponsorLogo = actor.sponsor
      ? `${this.config.imagehost}/${actor.sponsor}`
      : `${this.config.basehref}assets/sponsor.svg`
    ;

    actor.pendingName = actor.userApprovedName !== actor.userName
      ? actor.userName
      : ''
    ;
    const i = this.hubState.actors.indexOf(actor);

    if (
      i < 0 &&
      event.action !== HubEventAction.departed &&
      event.action !== HubEventAction.deleted
    ) {
      this.hubState.actors.push(actor);
    }

    if (i >= 0 && event.action === HubEventAction.deleted) {
      this.hubState.actors.splice(i, 1);
    }

    this.postState();
  }

  private postState(): void {
    this.state$.next(this.hubState);
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

export enum HubEventAction
{
  arrived = 'arrived',
  greeted = 'greeted',
  departed = 'departed',
  created = 'created',
  updated = 'updated',
  deleted = 'deleted',
  started = 'started'
}
