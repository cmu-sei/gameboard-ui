import { SimpleEntity } from "../api/models";

export interface SyncStartPlayer {
    id: string;
    name: string;
    isReady: boolean;
}

export interface SyncStartTeam {
    id: string;
    name: string;
    isReady: string;
    players: SyncStartPlayer[];
}

export interface SyncStartState {
    game: SimpleEntity,
    teams: SyncStartTeam[];
    isReady: boolean;
}

export interface SynchronizedGameStartedState {
    game: SimpleEntity;
    sessionBegin: Date;
    sessionEnd: Date;
    teams: { teamId: string, players: SimpleEntity[] }[];
}
