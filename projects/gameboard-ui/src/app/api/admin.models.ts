import { DateTime } from "luxon";
import { GameEngineType } from "./spec-models";

export interface AppActiveChallengeSpec {
    id: string;
    name: string;
    tag: string;
    challenges: AppActiveChallenge[];
    game: AppActiveChallengeGame;
}

export interface AppActiveChallenge {
    id: string;
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

export interface AppActiveChallengeGame {
    id: string;
    name: string;
    engine: GameEngineType;
    isTeamGame: boolean;
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
