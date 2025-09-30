// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { SignalRService } from './signalr.service';
import { ConfigService } from '@/utility/config.service';
import { LogService } from '../log.service';
import { UserService } from '@/api/user.service';
import { HubConnectionState } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { UserHubAnnouncement, UserHubEvent } from './user-hub.models';

@Injectable({ providedIn: 'root' })
export class UserHubService {
  private _signalRService: SignalRService;
  public hubState$: Observable<HubConnectionState>;

  private _announcements$ = new Subject<UserHubAnnouncement>();
  announcements$ = this._announcements$.asObservable();

  constructor(
    config: ConfigService,
    private logger: LogService,
    private userService: UserService) {
    this._signalRService = new SignalRService(config, this.logger, this.userService);
    this.hubState$ = this._signalRService.state$;
  }

  async connect() {
    await this._signalRService.connect(
      "hub/users",
      [
        { eventType: "announcement", handler: this.handleAnnouncement.bind(this) }
      ]
    );
  }

  async disconnect() {
    await this._signalRService.disconnect();
  }

  private handleAnnouncement(ev: UserHubEvent<UserHubAnnouncement>) {
    this._announcements$.next(ev.data);
  }
}
