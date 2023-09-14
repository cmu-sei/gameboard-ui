import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, firstValueFrom, map, timer } from 'rxjs';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { UserService } from '@/api/user.service';
import { ConfigService } from '@/utility/config.service';
import { LogService } from '@/services/log.service';
import { SignalRHubEventHandler } from './signalr-hub.models';

type SignalRHubEventHandlerCollection = { [eventType: string]: SignalRHubEventHandler<any> };

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private readonly AUTO_RECONNECT_INTERVALS = [1000, 2000, 3000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000];

  private _channelJoined$ = new Subject<string>();
  private _connection?: HubConnection;
  private _connectionState$ = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);
  private _events$ = new BehaviorSubject<SignalRHubEventHandler<any> | null>(null);
  private _eventHandlers: SignalRHubEventHandlerCollection = {};

  public channelJoined$ = this._channelJoined$.asObservable();
  public events$ = this._events$.asObservable();
  public state$ = this._connectionState$.asObservable();

  constructor(
    private config: ConfigService,
    private logger: LogService,
    private userService: UserService) {
  }

  public get connectionState(): HubConnectionState {
    return this._connection?.state || HubConnectionState.Disconnected;
  }

  public async connect(hubUrl: string, eventHandlers: SignalRHubEventHandler<any>[]) {
    const connectToUrl = `${this.config.apphost}${hubUrl}`;
    this.logger.logInfo(`Connecting to SignalR hub at ${connectToUrl}...`);

    if (this._connection?.baseUrl === hubUrl) {
      this.logger.logInfo(`Already connected to hub at "${connectToUrl}".`);
      return;
    }

    if (
      this._connection
      && (
        this._connectionState$.value == HubConnectionState.Connected ||
        this._connectionState$.value == HubConnectionState.Reconnecting
      )
    ) {
      this.logger.logInfo(`SignalRHub at URL ${connectToUrl} is in state "${this._connectionState$.value}". Disconnecting...`);
      await this.disconnect();
    }

    this.logger.logInfo(`Building connection to`, connectToUrl);
    this._connection = this.buildConnection(connectToUrl, eventHandlers);
    this.logger.logInfo(`Starting connection to`, connectToUrl);
    await this.resolveOpenConnection(this._connection);

    // this can resolve without an actual connection id, which is wild to me
    // have to check the connection state rather than id to confirm
    if (this._connection?.state == HubConnectionState.Connected) {
      this.logger.logInfo(`Connection started with url`, connectToUrl);
    }
    else if (this._connection.state == HubConnectionState.Connecting || this._connection?.state == HubConnectionState.Reconnecting) {
      this.logger.logWarning(`Connection with url ${connectToUrl} is in the Connecting state...`);
    }
    else {
      this.logger.logError(`CRITICAL: The SignalR service was unable to join hub "${connectToUrl}".`);
    }
  }

  private buildConnection(url: string, eventHandlers: SignalRHubEventHandler<any>[]): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => firstValueFrom(this.userService.ticket().pipe(map(r => r?.ticket))),
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
        headers: { "Content-Type": "application/json" }
      } as IHttpConnectionOptions)
      .withAutomaticReconnect(this.AUTO_RECONNECT_INTERVALS)
      .configureLogging(this.logger)
      .build();

    connection.onclose(err => this.handleClose.bind(this)(err));
    connection.onreconnected(cid => this.handleConnected.bind(this)(cid));
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

  private async resolveOpenConnection(connection: HubConnection, attemptCount = 0, maxAttempts = 5, attemptIntervals: number[] = [2000, 3000, 3000, 5000, 10000]): Promise<void> {
    await connection.start();
    if (connection.state === HubConnectionState.Connected) {
      this.handleConnected();
      return;
    }

    if (attemptCount >= maxAttempts) {
      throw new Error(`Couldn't connect to the SignalR hub at ${connection.baseUrl} after all retries were exhausted.`);
    }

    await firstValueFrom(timer(attemptIntervals[attemptCount]));
    const remainingIntervals = attemptIntervals.slice(1);
    return await this.resolveOpenConnection(connection, attemptCount + 1, maxAttempts, remainingIntervals);
  }

  private handleConnected(channelId?: string) {
    this.logger.logInfo(`SignalR Service | Connected ${(channelId ? `channel id "${channelId}"` : "")}`);
    this.updateState();

    if (channelId)
      this._channelJoined$.next(channelId);
  }

  public async disconnect(): Promise<void> {
    this.logger.logInfo("Disconnecting from hub at ", this._connection?.baseUrl);
    this._connection?.stop();
    this.logger.logInfo("Disconnected from", this._connection?.baseUrl);
  }

  public async sendMessage<T>(message: string, arg: T) {
    if (!this._connection || this._connection.state !== HubConnectionState.Connected) {
      this.logger.logError(`Can't send message "${message}" with parameters ${arg}. The hub is not connected (State: "${this._connection?.state}").`);
      return;
    }

    this.logger.logInfo(`Sending message "${message}" with params:`, arg);
    await this._connection.invoke(message, arg);
    this.logger.logInfo(`Message "${message}" sent.`);
  }

  private handleClose(err?: Error) {
    this.logger.logInfo("SignalR service connection closed.");
    this._eventHandlers = {};

    if (err) {
      this.logger.logError(`SignalR Service Error: ${err}`);
    }

    this.updateState();
  }

  private updateState(): void {
    this._connectionState$.next(this._connection?.state || HubConnectionState.Disconnected);
  }
}
