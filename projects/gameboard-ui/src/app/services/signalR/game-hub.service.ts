import { Injectable, OnDestroy } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, combineLatest, Subject, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SynchronizedGameStartedState, SyncStartState } from '../../game/game.models';
import { LocalStorageService, StorageKey } from '../local-storage.service';
import { LogService } from '../log.service';
import { HubState, NotificationService } from '../notification.service';

export interface GameHubEvent {
    gameId: string;
    eventType: GameHubEventType;
    data: any;
}

enum GameHubEventType {
    SyncStartGameStarting = "syncStartGameStarting",
    SyncStartStateChanged = "syncStartStateChanged"
}

@Injectable({ providedIn: 'root' })
export class GameHubService implements OnDestroy {
    private gameHubEventsSub?: Subscription;
    private manageJoinGameRequestSub?: Subscription;

    private _syncStartStateChanged$ = new Subject<SyncStartState>();
    private _syncStartGameStarted$ = new Subject<SynchronizedGameStartedState>()
    private _manualRefresh$ = new Subject<void>();

    public syncStartChanged$ = this._syncStartStateChanged$.asObservable();
    public syncStartGameStarted$ = this._syncStartGameStarted$.asObservable();
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

        combineLatest([
            this._manualRefresh$,
            notificationService.state$
        ]).pipe(
            map(([_, hubServiceState]) => ({ hubServiceState })),
            tap(ctx => this.maybeJoinGames(ctx.hubServiceState))
        ).subscribe();

        this.gameHubEventsSub = notificationService.gameHubEvents$.subscribe(ev => {
            console.log("event?", ev);
            console.log("does thing equal thing?", ev.eventType == GameHubEventType.SyncStartGameStarting);
            console.log("event's type", ev.eventType);
            console.log("the enum", GameHubEventType.SyncStartGameStarting);
            switch (ev.eventType) {
                case GameHubEventType.SyncStartStateChanged:
                    this._syncStartStateChanged$.next(ev.data as SyncStartState);
                    return;
                case GameHubEventType.SyncStartGameStarting:
                    this._syncStartGameStarted$.next(ev.data as SynchronizedGameStartedState);
                    return;
                default:
                    return;
            }
        });
    }

    public joinGame(gameId: string) {
        if (!gameId) {
            this.logger.logError("Can't join a blank GameId.");
            return;
        }

        // push the game into our local storage list to join and let our pipeline know it has work to do
        const gamesJoined = this.loadGameHubConnections();
        if (gamesJoined.indexOf(gameId) < 0) {
            gamesJoined.push(gameId);
            this.localStorageService.add(StorageKey.WantsGameHubConnections, JSON.stringify(gamesJoined))
        }

        this._manualRefresh$.next();
    }

    public leaveGame(gameId: string) {
        if (this.notificationService.state$.getValue().connectionState === HubConnectionState.Connected)
            this.notificationService.sendMessage("LeaveGame", gameId);

        this.removeFromPendingGameHubConnections(gameId);
    }

    private loadGameHubConnections(): string[] {
        return JSON.parse(this.localStorageService.get(StorageKey.WantsGameHubConnections) || '[]');
    }

    private async maybeJoinGames(hubState: HubState) {
        const gameIdsToJoin = this.loadGameHubConnections();
        if (hubState.connectionState === HubConnectionState.Connected && gameIdsToJoin.length) {
            for (let gameId of gameIdsToJoin) {
                // join the channel
                const state = await this.notificationService.sendMessage<SyncStartState>("JoinGame", gameId);
                this._syncStartStateChanged$.next(state);
            }
        }
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
