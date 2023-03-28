import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { SyncStartState } from '../../game/game.models';
import { SignalrService } from './signalr.service';

export interface GameHubEvent {
    gameId: string;
    eventType: GameHubEventType;
    gameEventData: any;
}

enum GameHubEventType {
    PlayerReadyStateChanged
}

@Injectable({ providedIn: 'root' })
export class GameHubService implements OnDestroy {
    private gameHubEventsSub?: Subscription;
    private syncStartStateChanged$ = new Subject<SyncStartState>();

    constructor(private signalr: SignalrService) {
        this.signalr.gameHubEvents$.subscribe(ev => {
            switch (ev.data.eventType) {
                case GameHubEventType.PlayerReadyStateChanged:
                    this.handlePlayerReadyStateChanged(ev.data);
                    return;
                default:
                    return;
            }
        });
    }

    private handlePlayerReadyStateChanged(ev: GameHubEvent) {
        this.syncStartStateChanged$.next(ev.gameEventData as SyncStartState);
    }

    ngOnDestroy(): void {
        this.gameHubEventsSub?.unsubscribe();
    }
}
