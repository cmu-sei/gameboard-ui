import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, timer } from 'rxjs';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { UserService } from '../../api/user.service';
import { ConfigService } from '../../utility/config.service';
import { LogService } from '../log.service';

export interface SignalRHubEventHandler<T> {
  eventName: string;
  handler: (data: T) => void;
}

@Injectable({ providedIn: 'root' })
export class SignalRService<T> {
  private _connection?: HubConnection;
  private _connectionState$ = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);
  private _events$ = new BehaviorSubject<SignalRHubEventHandler<T> | null>(null);
  private _eventHandlers: { [eventName: string]: SignalRHubEventHandler<T> } = {};
  public events$ = this._events$.asObservable();
  public state$ = this._connectionState$.asObservable();

  private _connectedGroups: string[] = [];

  constructor(
    private config: ConfigService,
    private logger: LogService,
    private userService: UserService) {
  }

  public get connectionState(): HubConnectionState {
    return this._connection?.state || HubConnectionState.Disconnected;
  }

  public async connect(hubUrl: string, eventHandlers: SignalRHubEventHandler<T>[]) {
    const connectToUrl = `${this.config.apphost}${hubUrl}`;
    this.logger.logInfo(`Connecting to SignalR hub at ${connectToUrl}...`);

    if (
      this._connection
      && (
        this._connectionState$.value == HubConnectionState.Connected ||
        this._connectionState$.value == HubConnectionState.Reconnecting
      )
    ) {
      this.logger.logInfo(`Currently in state ${this._connectionState$.value} state. Disconnecting...`);
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
    else {
      this.logger.logError(`The SignalR service was unable to join hub "${connectToUrl}" after all retries were exhausted.`);
    }
  }

  private buildConnection(url: string, eventHandlers: SignalRHubEventHandler<T>[]): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => firstValueFrom(this.userService.ticket().pipe(map(r => r?.ticket))),
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
        headers: { "Content-Type": "application/json" }
      } as IHttpConnectionOptions)
      .withAutomaticReconnect([1000, 2000, 3000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000])
      .configureLogging(this.logger)
      .build();

    connection.onclose(this.handleClose);
    connection.onreconnected(cid => this.handleConnected.bind(this)(cid));

    // federate specific event types to their respective services
    this._eventHandlers = {};
    for (let handler of eventHandlers) {
      this._eventHandlers[handler.eventName] = handler;
      connection.on(handler.eventName, ev => handler.handler(ev));
    }

    return connection;
  }

  private async resolveOpenConnection(connection: HubConnection, attemptCount = 0, maxAttempts = 5): Promise<void> {
    if (attemptCount >= maxAttempts) {
      throw new Error("Couldn't connect to the SignalR hub.");
    }

    await connection.start();
    if (connection.state === HubConnectionState.Connected) {
      this.handleConnected();
      return;
    }

    const attemptIntervals = [2000, 3000, 3000, 5000, 10000];
    await firstValueFrom(timer(attemptIntervals[attemptCount]));

    return await this.resolveOpenConnection(connection, attemptCount + 1);
  }

  private handleConnected(channelId?: string) {
    this.logger.logInfo(`SignalR Service | Connected`);
    this.logger.logInfo("Reconnected channel:", channelId);
    this.updateState();
  }

  public async disconnect(): Promise<void> {
    this.logger.logInfo("Disconnecting from hub at ", this._connection?.baseUrl);
    this._connection?.stop();
    this.logger.logInfo("Disconnected from", this._connection?.baseUrl);
  }

  public async sendMessage<T>(message: string, arg: T) {
    if (!this._connection || this._connection.state !== HubConnectionState.Connected) {
      this.logger.logError(`Can't send message "${message}" with parameters ${arg}. The hub is not connected.`);
      return;
    }

    this.logger.logInfo(`Sending message "${message}" with params:`, arg);
    await this._connection.invoke(message, arg);
    this.logger.logInfo(`Message "${message}" sent.`);
  }

  private handleClose(err?: Error) {
    if (err) {
      this.logger.logError(`SignalR Service Error: ${err}`);
    }

    this.updateState();
  }

  private updateState(): void {
    this._connectionState$.next(this._connection?.state || HubConnectionState.Disconnected);
  }
}
