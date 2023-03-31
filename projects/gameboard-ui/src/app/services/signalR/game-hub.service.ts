import { Injectable, OnDestroy } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, combineLatest, Subject, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SyncStartState } from '../../game/game.models';
import { LocalStorageService, StorageKey } from '../../utility/services/local-storage.service';
import { LogService } from '../log.service';
import { NotificationService } from '../notification.service';

export interface GameHubEvent {
    gameId: string;
    eventType: GameHubEventType;
    data: any;
}

enum GameHubEventType {
    SyncStartStateChanged = "syncStartStateChanged"
}

@Injectable({ providedIn: 'root' })
export class GameHubService implements OnDestroy {
    private gameHubEventsSub?: Subscription;
    private manageJoinGameRequestSub?: Subscription;
    private _syncStartStateChanged$ = new Subject<SyncStartState>();

    public syncStartChanged$ = this._syncStartStateChanged$.asObservable();
    public joinGameRequest$ = new BehaviorSubject<string | null>(null);

    // TODO: someday, refactor core connection stuff into a the signalr service and create federated services for each channel type
    // constructor(private signalr: SignalrService) {
    //     this.signalr.gameHubEvents$.subscribe(ev => {
    //         switch (ev.data.eventType) {
    //             case GameHubEventType.PlayerReadyStateChanged:
    //                 this.handlePlayerReadyStateChanged(ev.data);
    //                 return;
    //             default:
    //                 return;
    //         }
    //     });
    // }

    constructor(
        private localStorageService: LocalStorageService,
        private logger: LogService,
        private notificationService: NotificationService) {
        this.manageJoinGameRequestSub = combineLatest([
            notificationService.state$,
            // this.joinGameRequest$
        ]).pipe(
            // map(([hubServiceState, joinGameRequest]) => ({ hubServiceState, joinGameRequest })),
            map(([hubServiceState]) => ({ hubServiceState })),
            tap(async ctx => {
                const gameIdsToJoin = this.loadGameHubConnections();
                if (ctx.hubServiceState.connectionState === HubConnectionState.Connected && gameIdsToJoin?.length) {
                    for (let gameId of gameIdsToJoin) {
                        this.joinGame(gameId);
                    }
                }
            })
        ).subscribe();

        this.gameHubEventsSub = notificationService.gameHubEvents$.subscribe(ev => {
            switch (ev.eventType) {
                case GameHubEventType.SyncStartStateChanged:
                    this._syncStartStateChanged$.next(ev.data as SyncStartState);
                    return;
                default:
                    return;
            }
        });
    }

    public async joinGame(gameId: string) {
        if (!gameId) {
            this.logger.logError("Can't join a blank GameId.");
            return;
        }

        if (this.notificationService.connection.state === HubConnectionState.Connected) {
            // join the channel
            const state = await this.notificationService.sendMessage<SyncStartState>("JoinGame", gameId);
            this._syncStartStateChanged$.next(state);

            return;
        }

        // if we're not connected now, we need to save the game to join in local storage so that we can join it when the connection to the hub starts
        const gamesJoined = this.loadGameHubConnections();
        if (gamesJoined.indexOf(gameId) < 0) {
            gamesJoined.push(gameId);
            this.localStorageService.add(StorageKey.WantsGameHubConnections, JSON.stringify(gamesJoined))
        }
    }

    public leaveGame(gameId: string) {
        if (this.notificationService.state$.getValue().connectionState === HubConnectionState.Connected)
            this.notificationService.sendMessage("LeaveGame", gameId);

        this.removeFromPendingGameHubConnections(gameId);
    }

    private loadGameHubConnections(): string[] {
        return JSON.parse(this.localStorageService.get(StorageKey.WantsGameHubConnections) || '[]');
    }

    private removeFromPendingGameHubConnections(gameId: string) {
        const gameIdsToJoin: string[] = this
            .loadGameHubConnections()
            .filter(g => g !== gameId);

        this.localStorageService.add(StorageKey.WantsGameHubConnections, JSON.stringify(gameIdsToJoin));
    }

    ngOnDestroy(): void {
        this.gameHubEventsSub?.unsubscribe();
        this.manageJoinGameRequestSub?.unsubscribe();
    }
}
