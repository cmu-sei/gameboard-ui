// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { LogService } from '../log.service';
import { SignalRService } from './signalr.service';
import { SupportHubEvent, SupportHubEventType, TicketClosedEvent, TicketCreatedEvent, TicketUpdatedBySupportEvent, TicketUpdatedByUserEvent } from './support-hub.models';
import { AppNotificationsService } from '../app-notifications.service';
import { ConfigService } from '@/utility/config.service';
import { UserService } from '@/api/user.service';
import { HubConnectionState } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { RouterService } from '../router.service';

@Injectable({ providedIn: 'root' })
export class SupportHubService {
  public hubState$: Observable<HubConnectionState>;
  private _signalRService: SignalRService;

  constructor(
    configService: ConfigService,
    userService: UserService,
    private appNotificationsService: AppNotificationsService,
    private routerService: RouterService,
    private logService: LogService
  ) {
    this._signalRService = new SignalRService(configService, logService, userService);
    this.hubState$ = this._signalRService.state$;
  }

  async disconnect() {
    await this._signalRService.disconnect();
  }

  // Should _only_ be called once per login by the component which is
  // managing all SignalR connections (GameboardSignalRHubsComponent)
  async connect() {
    await this._signalRService.connect(
      "hub/support",
      [
        { eventType: SupportHubEventType.TicketClosed, handler: this.handleTicketClosed.bind(this) },
        { eventType: SupportHubEventType.TicketCreated, handler: this.handleTicketCreated.bind(this) },
        { eventType: SupportHubEventType.TicketUpdatedBySupport, handler: this.handleTicketUpdatedBySupport.bind(this) },
        { eventType: SupportHubEventType.TicketUpdatedByUser, handler: this.handleTicketUpdatedByUser.bind(this) }
      ]
    );
  }

  private handleTicketClosed(ev: SupportHubEvent<TicketClosedEvent>) {
    this.logService.logInfo("[GB Support Hub Staff Group]: Ticket Closed", ev);

    this.appNotificationsService.send({
      title: `Ticket Closed: ${ev.data.ticket.key}`,
      body: ev.data.ticket.summary,
      appUrl: this.routerService.getTicketUrl(ev.data.ticket.id),
      tag: `support-closed-${ev.data.ticket.id}`
    });
  }

  private handleTicketCreated(ev: SupportHubEvent<TicketCreatedEvent>) {
    this.logService.logInfo("[GB Support Hub Staff Group]: Ticket Created", ev);

    this.appNotificationsService.send({
      title: `New Ticket: ${ev.data.ticket.key}`,
      body: ev.data.ticket.summary,
      appUrl: this.routerService.getTicketUrl(ev.data.ticket.id),
      tag: `support-created-${ev.data.ticket.id}`
    });
  }

  private handleTicketUpdatedBySupport(ev: SupportHubEvent<TicketUpdatedBySupportEvent>) {
    this.logService.logInfo("[GB Support Hub Staff Group]: Ticket updated by support", ev);

    this.appNotificationsService.send({
      title: `Ticket updated by Support: ${ev.data.ticket.key}`,
      body: ev.data.ticket.summary,
      appUrl: this.routerService.getTicketUrl(ev.data.ticket.id),
      tag: `support-updated-by-support-${ev.data.ticket.id}`
    });
  }

  private handleTicketUpdatedByUser(ev: SupportHubEvent<TicketUpdatedByUserEvent>) {
    this.logService.logInfo("[GB Support Hub Staff Group]: Ticket updated by support", ev);

    this.appNotificationsService.send({
      title: `Ticket updated by Player: ${ev.data.ticket.key}`,
      body: ev.data.ticket.summary,
      appUrl: this.routerService.getTicketUrl(ev.data.ticket.id),
      tag: `support-updated-by-user-${ev.data.ticket.id}`
    });
  }
}
