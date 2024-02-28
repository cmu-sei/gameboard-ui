import { DateTime } from "luxon";
import { SimpleEntity } from "./models";
import { GameEngineType } from "./spec-models";

export interface AppActiveChallengeSpec {
    id: string;
    name: string;
    challenges: AppActiveChallenge[];
}

export interface AppActiveChallenge {
    id: string;
    game: SimpleEntity;
    gameEngine: GameEngineType;
    startedAt: DateTime;
    team: {
        id: string;
        name: string;
        session: {
            start: DateTime;
            end: DateTime;
        }
    }
}

export interface GetAppActiveChallengesResponse {
    specs: AppActiveChallengeSpec[];
}

export interface GetSiteOverviewStatsResponse {
    activeCompetitiveChallenges: number;
    activePracticeChallenges: number;
    activeCompetitiveTeams: number;
    registeredUsers: number;
}
