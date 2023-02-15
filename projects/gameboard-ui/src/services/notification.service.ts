// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { BehaviorSubject, combineLatest, of, Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map, takeUntil } from 'rxjs/operators';
import { ConfigService } from '../app/utility/config.service';
import { AuthService, AuthTokenState } from '../app/utility/auth.service';
import { UserService } from '../app/api/user.service';
import { Player } from '../app/api/player-models';
import { UserService as CurrentUserService } from '../app/utility/user.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  public connection: HubConnection;
  private hubState: HubState = { id: '', connectionState: HubConnectionState.Disconnected, joined: false, actors: [] };
  private teamId$ = new Subject<string>();
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
    private userSvc: CurrentUserService
  ) {
    this.connection = this.getConnection(`${config.apphost}hub`);
    this.userSvc.user$.pipe(first()).subscribe(u => this.userId = u?.id || null);

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

      if (ctx.id != this.hubState.id) {
        await this.maybeConnect(ctx.id, true);

        // join and post events
        await this.joinChannel(ctx.id);
        this.connection.invoke("Greet");
        this.presenceEvents.next({ action: HubEventAction.arrived, model: ctx.id });
      }
    });
  }

  async init(groupId: string, preserveExisting = true): Promise<HubState> {
    await this.maybeConnect(groupId, preserveExisting);
    this.teamId$.next(groupId);
    return this.hubState;
  }

  async initActors(teamId: string): Promise<void> {
    this.hubState.actors = [];

    if (!teamId || this.connection.state != HubConnectionState.Connected) {
      return;
    }

    const players: Player[] = await this.connection.invoke("ListTeam", teamId) as unknown as Player[];

    players.forEach(p => {
      this.hubState.actors.push({
        ...p,
        userApprovedName: p.approvedName,
        userName: p.name,
        pendingName: p.userName === p.userApprovedName ? p.userName : '',
        userNameStatus: p.nameStatus,
        online: true,
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
      if (this.hubState.id !== id && this.hubState.joined) {
        await this.leaveChannel();
      }

      if (!!id) {
        try {
          await this.connection.invoke('Listen', id);

          this.hubState.id = id;
          this.hubState.joined = true;

          await this.initActors(id);
        }
        catch (listenErr) {
          console.error(`Error on calling "Listen":`, listenErr)
        }

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
        accessTokenFactory: () => this.apiUserSvc.ticket().pipe(map(result => result.ticket)).toPromise(),
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      } as IHttpConnectionOptions)
      .withAutomaticReconnect([1000, 2000, 3000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000])
      .configureLogging(LogLevel.Information)
      .build();

    connection.onclose(err => this.setDisconnected());
    connection.onreconnecting(err => this.setDisconnected());
    connection.onreconnected(cid => this.setConnected());

    connection.on('teamEvent', (e: HubEvent) => this.teamEvents.next(e));
    connection.on('challengeEvent', (e: HubEvent) => this.challengeEvents.next(e));
    connection.on('announcement', (e: HubEvent) => this.announcements.next(e));
    connection.on('ticketEvent', (e: HubEvent) => this.ticketEvents.next(e));

    connection.on('presenceEvent', (event: HubEvent) => {
      if (event.action === HubEventAction.arrived && event.model?.id != this.userId) {
        this.connection.invoke("Greet");
      }

      this.initActors(this.hubState.id);
      this.presenceEvents.next(event);
      this.postState();
    });

    return connection;
  }

  private async maybeConnect(groupId: string, preserveExisting: boolean): Promise<HubState> {
    try {
      if (
        this.hubState &&
        this.connection.state === HubConnectionState.Connected
      ) {
        // if the caller wants to trash the existing connection, do that and start again
        if (!preserveExisting) {
          await this.disconnect();
          return await this.maybeConnect(groupId, preserveExisting);
        }

        // it's okay if they're connected but not in a group - we can fix that
        if (groupId == this.hubState.id || !this.hubState.id) {
          await this.joinChannel(groupId);
        }

        return this.hubState;
      }

      console.log("Called with", groupId, preserveExisting);



      // if we make it here, we need to connect and possibly rejoin the channel requested
      if (this.connection.state != HubConnectionState.Disconnected) {
        console.log("what the state", this.connection.state);
      }

      await this.connection.start();
      await this.joinChannel(groupId);

      if (this.hubState.connectionState != HubConnectionState.Connected) {
        console.warn(`Couldn't connect to the hub on group ${groupId}. State:`, this.hubState);
      }

      return this.hubState;
    } catch (e) {
      console.error(`Error connecting to the hub on group ${groupId} → `, e);
      timer(5000).subscribe(() => this.maybeConnect(groupId, preserveExisting));
    } finally {
      return this.hubState;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.connection?.state === HubConnectionState.Connected) {
        await this.leaveChannel();
        await this.connection.stop();
        this.setDisconnected();
      }
    } finally { }
  }

  private async setConnected(): Promise<void> {
    this.hubState.connectionState = this.connection.state;
    this.postState();

    if (this.hubState.id) {
      await this.joinChannel(this.hubState.id); // rejoin if was previously joined
    }
  }

  private setDisconnected(): void {
    this.hubState.connectionState = this.connection.state;
    this.hubState.joined = false;
    this.hubState.actors = [];
    this.postState();
  }

  private postState(): void {
    this.state$.next(this.hubState);
  }
}

export interface HubState {
  id: string;
  connectionState: HubConnectionState;
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
