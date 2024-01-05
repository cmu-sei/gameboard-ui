import { Inject, Injectable } from '@angular/core';
import { LogService } from '../log.service';
import { SignalRService } from './signalr.service';
import { SupportHubEvent, SupportHubEventType, TicketClosedEvent, TicketCreatedEvent } from './support-hub.models';
import { AppNotificationsService } from '../app-notifications.service';

@Injectable({ providedIn: 'root' })
export class SupportHubService {
  public hubState$ = this.signalRService.state$;

  constructor(
    private appNotificationsService: AppNotificationsService,
    private logService: LogService,
    @Inject(SignalRService) private signalRService: SignalRService) { }

  async disconnect() {
    await this.signalRService.disconnect();
  }

  // Should _only_ be called once per login by the component which is
  // managing all SignalR connections (GameboardSignalRHubsComponent)
  async connect() {
    await this.signalRService.connect(
      "hub/support",
      [
        { eventType: SupportHubEventType.TicketClosed, handler: this.handleTicketClosed.bind(this) },
        { eventType: SupportHubEventType.TicketCreated, handler: this.handleTicketCreated.bind(this) }
      ]
    );
  }

  public async joinStaffGroup() {
    await this.signalRService.sendMessage("joinStaffGroup");
  }

  private handleTicketClosed(ev: SupportHubEvent<TicketClosedEvent>) {
    this.logService.logInfo("[GB Support Hub Staff Group]: Ticket Closed", ev);

    this.appNotificationsService.send({
      title: `Ticket Closed: ${ev.data.ticket.key}`,
      body: ev.data.ticket.summary,
      appUrl: `support/tickets/${ev.data.ticket.id}`,
      tag: `support-closed-${ev.data.ticket.id}`
    });
  }

  private handleTicketCreated(ev: SupportHubEvent<TicketCreatedEvent>) {
    this.logService.logInfo("[GB Support Hub Staff Group]: Ticket Created", ev);

    this.appNotificationsService.send({
      title: `New Ticket: ${ev.data.ticket.key}`,
      body: ev.data.ticket.summary,
      appUrl: `support/tickets/${ev.data.ticket.id}`,
      tag: `support-created-${ev.data.ticket.id}`
    });
  }
}
