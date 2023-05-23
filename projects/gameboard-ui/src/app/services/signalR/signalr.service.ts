import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions, LogLevel } from '@microsoft/signalr';
import { map } from 'rxjs/operators';
import { UserService } from '../../api/user.service';
import { ConfigService } from '../../utility/config.service';
import { LogService } from '../log.service';
import { GameHubEvent } from './game-hub.service';

export interface SignalRHubEvent<T> {
  channelId: string;
  data: T;
}

export interface SignalRHubState {
  connectionState: HubConnectionState;
}

interface SignalRHubStateUpdate {
  connectionState?: HubConnectionState;
}

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private signalRConnection: HubConnection;
  private _gameHubEvents$ = new Subject<SignalRHubEvent<GameHubEvent<any>>>;
  private _state$ = new BehaviorSubject<SignalRHubState>({ connectionState: HubConnectionState.Disconnected });

  public gameHubEvents$ = this._gameHubEvents$.asObservable();
  public state$ = this._state$.asObservable();

  constructor(
    config: ConfigService,
    private logger: LogService,
    private userService: UserService) {
    this.signalRConnection = this.getConnection(`${config.apphost}hub`);
  }

  private getConnection(url: string): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => this.userService.ticket().pipe(map(result => result.ticket)).toPromise(),
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      } as IHttpConnectionOptions)
      .withAutomaticReconnect([1000, 2000, 3000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000])
      .configureLogging(LogLevel.Information)
      .build();

    connection.onclose(this.handleClose);
    connection.onreconnected(cid => this.handleConnected);

    // federate specific event types to their respective services
    connection.on('gameHubEvent', (ev: SignalRHubEvent<GameHubEvent<any>>) => this._gameHubEvents$.next(ev));

    return connection;
  }

  private handleConnected(channelId: string) {
    this.logger.logInfo(`SignalR Service | Connected -> ${channelId}`);
  }

  private handleClose(err?: Error) {
    if (err) {
      this.logger.logError(`SignalR Service Error: ${err}`);
    }

    this.updateConnectionState();
  }

  private updateConnectionState() {
    this.updateState({
      connectionState: this.signalRConnection.state
    });
  }

  private updateState(update: SignalRHubStateUpdate) {
    const currentState = this._state$.getValue();
    const finalState: SignalRHubState = {
      connectionState: update.connectionState || currentState.connectionState
    };

    this._state$.next(finalState);
  }
}
