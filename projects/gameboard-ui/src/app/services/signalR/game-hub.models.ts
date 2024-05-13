import { SimpleEntity } from "@/api/models";
import { SignalRHubEventType } from "./signalr-hub.models";
import { GameEngineType } from "@/api/spec-models";
import { GameState } from "@/api/board-models";

export interface GameHubEvent {
    gameId: string;
}

export interface GameHubEventWith<T> extends GameHubEvent {
    data: T;
}

export class GameHubEventType implements SignalRHubEventType {
    static ChallengesDeployStart = "ChallengesDeployStart";
    static ChallengesDeployProgressChange = "ChallengesDeployProgressChange";
    static ChallengesDeployEnd = "ChallengesDeployEnd";
    static GamespacesDeployStart = "GamespacesDeployStart";
    static GamespacesDeployProgressChange = "GamespacesDeployProgressChange";
    static GamespacesDeployEnd = "GamespacesDeployEnd";
    static LaunchStart = "LaunchStart";
    static LaunchEnd = "LaunchEnd";
    static LaunchFailure = "LaunchFailure";
    static SyncStartGameStarted = "SyncStartGameStarted";
    static SyncStartGameStarting = "SyncStartGameStarting";
    static SyncStartGameStateChanged = "SyncStartGameStateChanged";
}

export interface GameHubActiveEnrollment {
    game: SimpleEntity;
    player: SimpleEntity;
}

export interface GameHubResourcesDeployStatus {
    game: SimpleEntity;
    challengeSpecs: SimpleEntity[];
    challenges: GameHubResourcesDeployChallenge[];
    teams: GameHubResourcesDeployTeam[];
    failedGamespaceDeployChallengeIds: string[];
    err?: string;
}

export interface GameHubResourcesDeployChallenge {
    id: string;
    name: string;
    engine: GameEngineType;
    hasGamespace: boolean;
    isActive: boolean;
    isFullySolved: boolean;
    specId: string;
    state: GameState;
    teamId: string;
}

export interface GameHubResourcesDeployPlayer {
    id: string;
    name: string;
    userId: string;
}

export interface GameHubResourcesDeployTeam {
    id: string;
    name: string;
    captain: GameHubResourcesDeployPlayer;
    players: GameHubResourcesDeployPlayer[];
}
