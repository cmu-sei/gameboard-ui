import { SimpleEntity } from "@/api/models";
import { SignalRHubEventType } from "./signalr-hub.models";
import { GameEngineType } from "@/api/spec-models";

export interface GameHubEvent<T> {
    gameId: string;
    data: T;
    eventType: GameHubEventType;
}

export class GameHubEventType implements SignalRHubEventType {
    static ExternalGameChallengesDeployStart = "externalGameChallengesDeployStart";
    static ExternalGameChallengesDeployProgressChange = "externalGameChallengesDeployProgressChange";
    static ExternalGameChallengesDeployEnd = "externalGameChallengesDeployEnd";
    static ExternalGameGamespacesDeployStart = "externalGameGamespacesDeployStart";
    static ExternalGameGamespacesDeployProgressChange = "externalGameGamespacesDeployProgressChange";
    static ExternalGameGamespacesDeployEnd = "externalGameGamespacesDeployEnd";
    static ExternalGameLaunchStart = "externalGameLaunchStart";
    static ExternalGameLaunchEnd = "externalGameLaunchEnd";
    static ExternalGameLaunchFailure = "externalGameLaunchFailure";
    static PlayerJoined = "playerJoined";
    static SyncStartGameStarted = "syncStartGameStarted";
    static SyncStartGameStarting = "syncStartGameStarting";
    static SyncStartGameStateChanged = "syncStartGameStateChanged";
    static VerifyAllPlayersConnectedStart = "verifyAllPlayersConnectedStart";
    static VerifyAllPlayersConnectedCountChange = "verifyAllPlayersConnectedCountChange";
    static VerifyAllPlayersConnectedEnd = "verifyAllPlayersConnectedEnd";
    static YouJoined = "YouJoined";
}

export interface PlayerJoinedEvent {
    gameId: string;
    player: SimpleEntity;
}

export interface YouJoinedEvent {
    connectionId: string;
    userId: string;
}

export interface GameStartState {
    game: SimpleEntity;
    challengesCreated: number;
    challengesTotal: number;
    gamespacesStarted: number;
    gamespacesStartFailed: number;
    gamespacesTotal: number;

    startTime: Date,
    now: Date,

    error: string;
}

export interface GameStartStateChallenge {
    challenge: SimpleEntity;
    gameEngineType: GameEngineType;
    teamId: string;
}

export interface GameStartStatePlayer {
    player: SimpleEntity;
    teamId: string;
}

export interface GameStartStateTeam {
    team: SimpleEntity;
    captain: GameStartStateCaptain;
    headlessUrl: string;
}

export interface GameStartStateCaptain {
    player: SimpleEntity;
    userId: string;
}
