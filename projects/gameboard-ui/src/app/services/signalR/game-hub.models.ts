import { SimpleEntity } from "@/api/models";

export interface NewGameHubEvent<T> {
    gameId: string;
    data: T;
    eventType: NewGameHubEventType;
}

export enum NewGameHubEventType {
    DeployChallengesStart,
    DeployChallengesPercentageChange,
    DeployChallengesEnd,
    PlayerJoined,
    SyncStartGameStarting,
    SyncStartGameStateChanged,
    VerifyAllPlayersConnectedStart,
    VerifyAllPlayersConnectedCountChange,
    VerifyAllPlayersConnectedEnd,
}

export interface PlayerJoinedEvent {
    gameId: string;
    player: SimpleEntity;
}
