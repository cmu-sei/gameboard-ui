import { SimpleEntity } from "@/api/models";
import { SignalRHubEventType } from "./signalr-hub.models";

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

export interface ExternalGameCreationState {
    game: SimpleEntity;
    challengesCreated: number;
    challengesTotal: number;
    gamespacesDeployed: number;
    gamespacesTotal: number;
    playersTotal: number;
    teamsTotal: number;
    overallProgress: number;

    startTime: Date,
    now: Date,

    error: string;
}
