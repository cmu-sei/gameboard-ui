import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, timer } from 'rxjs';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { UserService } from '@/api/user.service';
import { ConfigService } from '@/utility/config.service';
import { LogService } from '@/services/log.service';
import { SignalRHubEventHandler } from './signalr-hub.models';

type SignalRHubEventHandlerCollection = { [eventType: string]: SignalRHubEventHandler<any> };

@Injectable()
export class SignalRService {
  private readonly AUTO_RECONNECT_INTERVALS = [1000, 2000, 3000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000];

  private _connection?: HubConnection;
  private _connectionId$ = new BehaviorSubject<string | null>(null);
  private _connectionState$ = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);
  private _events$ = new BehaviorSubject<SignalRHubEventHandler<any> | null>(null);
  private _eventHandlers: SignalRHubEventHandlerCollection = {};

  public connectionId$ = this._connectionId$.asObservable();
  public events$ = this._events$.asObservable();
  public state$ = this._connectionState$.asObservable();

  constructor(
    private config: ConfigService,
    private logger: LogService,
    private userService: UserService) { }

  public get connectionState(): HubConnectionState {
    return this._connectionState$.value;
  }

  public async connect(hubUrl: string, eventHandlers: SignalRHubEventHandler<any>[]) {
    const connectToUrl = `${this.config.apphost}${hubUrl}`;
    this.logger.logInfo(this.formatForlog(`Connecting to SignalR hub at ${connectToUrl}...`));

    if (this._connection?.baseUrl === hubUrl && this._connection?.state == HubConnectionState.Connected) {
      this.logger.logInfo(this.formatForlog(`Already connected to hub at "${connectToUrl}".`));
      return;
    }

    if (this._connection && this.isConnectedOrConnectingState(this._connection?.state)) {
      this.logger.logInfo(this.formatForlog(`SignalRHub at URL ${connectToUrl} is in state "${this._connectionState$.value}". Disconnecting...`));
      await this.disconnect();
    }

    this.logger.logInfo(this.formatForlog("Building connection to", connectToUrl));
    this._connection = this.buildConnection(connectToUrl, eventHandlers);

    this.logger.logInfo(this.formatForlog("Starting connection to", connectToUrl));
    await this.resolveOpenConnection(this._connection);

    // because we skip negotiation below (which has unclear benefit to us but we're not messing with it for now)
    // this can/does resolve without a connection id, so check the state instead
    if (this._connection?.state == HubConnectionState.Connected) {
      this.logger.logInfo(`Connection started with url`, connectToUrl);
    }
    else if (this._connection.state == HubConnectionState.Connecting || this._connection?.state == HubConnectionState.Reconnecting) {
      this.logger.logInfo(`Connection with url ${connectToUrl} is in the Connecting state...`);
    }
    else {
      this.logger.logError(`CRITICAL: The SignalR service was unable to join hub "${connectToUrl}".`);
    }

    this.updateState();
  }

  public async disconnect(): Promise<void> {
    this.logger.logInfo("Disconnecting from hub at ", this._connection?.baseUrl);
    this._connection?.stop();
    this.updateState();
    this.logger.logInfo("Disconnected from", this._connection?.baseUrl);
  }

  public sendMessage(message: string) {
    return this.sendMessageWithArg<null>(message, null);
  }

  public async sendMessageWithArg<T>(message: string, arg: T) {
    if (!this._connection) {
      this.logger.logError(this.formatForlog(`Can't send message ${message} with parameters ${arg}. The connection has not been created.`));
      return;
    }

    if (this._connection.state !== HubConnectionState.Connected) {
      this.updateState();
      this.logger.logWarning(`Can't send message "${message}" with parameters ${arg}. The hub is not connected (State: "${this._connection?.state}"). Attempting to connect...`);
      await this.resolveOpenConnection(this._connection);
      this.logger.logWarning(`Connected. Now sending message: "${message}."`);
    }

    this.logger.logInfo(this.formatForlog(`Sending message "${message}" to connection "${this._connection?.baseUrl} => ${this._connection.connectionId}" with params:`, arg));
    if (arg)
      await this._connection.invoke(message, arg);
    else
      await this._connection.invoke(message);
    this.logger.logInfo(this.formatForlog(`Message "${message}" sent.`));
  }

  private buildConnection(url: string, eventHandlers: SignalRHubEventHandler<any>[]): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => {
          let authResult: any = null;
          try {
            authResult = firstValueFrom(this.userService.ticket().pipe(map(r => r?.ticket)));
          }
          catch (err: any) {
            this.logger.logError("[GB SignalR Error]:", err);
            this.updateState();
          }

          return authResult;
        },
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
        headers: { "Content-Type": "application/json" }
      } as IHttpConnectionOptions)
      .withAutomaticReconnect(this.AUTO_RECONNECT_INTERVALS)
      .configureLogging(this.logger)
      .build();

    connection.onclose(err => this.handleClose.bind(this)(err));
    connection.onreconnected(cid => this.handleConnected.bind(this)(cid));
    connection.onreconnecting(err => this.handleReconnecting.bind(this)(err));
    this.bindEventHandlersToConnection(connection, eventHandlers, this._eventHandlers);

    return connection;
  }

  private bindEventHandlersToConnection(connection: HubConnection, newEventHandlers: SignalRHubEventHandler<any>[], existingEventHandlers: SignalRHubEventHandlerCollection) {
    // if any handlers are already bound, unbind them
    for (const handlerEvent in existingEventHandlers) {
      connection.off(existingEventHandlers[handlerEvent].eventType.toString());
    }

    // federate specific event types to their respective services
    this._eventHandlers = {};
    for (let handler of newEventHandlers) {
      this._eventHandlers[handler.eventType.toString()] = handler;
      connection.on(handler.eventType.toString(), ev => handler.handler(ev));
    }
  }

  private isConnectedOrConnectingState(state?: HubConnectionState) {
    return !!state && (state == HubConnectionState.Connected || state == HubConnectionState.Connecting || state == HubConnectionState.Reconnecting);
  }

  private async resolveOpenConnection(connection: HubConnection, attemptIntervals: number[] = this.AUTO_RECONNECT_INTERVALS): Promise<void> {
    if (connection.state == HubConnectionState.Disconnected) {
      this.logger.logInfo("Disconnected - connecting to the SignalR hub at", connection.baseUrl);
      await connection.start();
    }

    if (connection.state === HubConnectionState.Connected) {
      this.logger.logInfo("Already connected to SignalR hub at", connection.baseUrl);
      this.handleConnected(connection.connectionId || undefined);
      return;
    }

    if (attemptIntervals.length == 0) {
      this.logger.logError(`Couldn't connect to the SignalR hub at ${connection.baseUrl} after all retries were exhausted.`);
      return;
    }

    await firstValueFrom(timer(attemptIntervals[attemptIntervals[0]]));
    const remainingIntervals = attemptIntervals.slice(1);
    return await this.resolveOpenConnection(connection, remainingIntervals);
  }

  private handleConnected(connectionId?: string) {
    this.logger.logInfo(`SignalR Service | Connected ${(connectionId ? `connection id "${connectionId}"` : "")}`);
    this._connectionId$.next(connectionId || null);
    this.updateState();
  }

  private handleClose(err?: Error) {
    this.logger.logInfo(this.formatForlog("SignalR service connection closed."));
    this._eventHandlers = {};
    this._connectionId$.next(null);

    if (err) {
      this.logger.logError(this.formatForlog(`SignalR Service Error: ${err}`));
    }

    this.updateState();
  }

  private handleReconnecting(err?: Error) {
    this.logger.logInfo(this.formatForlog("SignalR service is reconnecting..."), err);
    this.updateState();
  }

  private formatForlog(...params: any[]): any[] {
    return ["[GB SignalRService]:", ...params];
  }

  private updateState(): void {
    this.logger.logInfo(`Hub ${this._connection?.connectionId} is in state ${this._connection?.state}`);
    this._connectionState$.next(this._connection?.state || HubConnectionState.Disconnected);
  }
}
