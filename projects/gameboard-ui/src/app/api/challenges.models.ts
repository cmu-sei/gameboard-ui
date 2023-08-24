import { ApiTimeWindow, LocalTimeWindow } from "@/core/models/api-time-window";
import { PlayerMode } from "./player-models";
import { VmState } from "./board-models";
import { SimpleEntity } from "./models";
import { NumberUnitLength } from "luxon";

export interface ActiveChallenge {
    spec: {
        id: string;
        name: string;
        tag: string;
        averageDeploySeconds: number;
    };
    game: SimpleEntity;
    player: SimpleEntity;
    user: SimpleEntity;
    challengeDeployment: {
        challengeId: string,
        isDeployed: boolean;
        vms: VmState[]
    };
    teamId: string;
    playerMode: PlayerMode;
    scoreAndAttemptsState: {
        score: number;
        maxPossibleScore: number;
        attempts: number;
        maxAttempts: number;
    }
}

export interface ApiActiveChallenge extends ActiveChallenge {
    session: ApiTimeWindow;
}

export interface LocalActiveChallenge extends ActiveChallenge {
    session: LocalTimeWindow;
}

export interface UserApiActiveChallenges {
    user: SimpleEntity;
    competition: ApiActiveChallenge[];
    practice: ApiActiveChallenge[];
}

export interface UserActiveChallenges {
    user: SimpleEntity;
    competition: LocalActiveChallenge[];
    practice: LocalActiveChallenge[];
}
