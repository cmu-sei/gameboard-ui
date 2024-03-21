import { DateTime } from "luxon";
import { GameEngineType } from "./spec-models";
import { SimpleEntity } from "./models";

export interface AppActiveChallengeSpec {
    id: string;
    name: string;
    tag: string;
    challenges: AppActiveChallenge[];
    game: AppActiveChallengeGame;
}

export interface AppActiveChallenge {
    id: string;
    hasTickets: boolean;
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

export interface GetAppActiveTeamsResponse {
    teams: AppActiveTeam[];
}

export interface AppActiveTeam {
    id: string;
    name: string;
    session: { start: DateTime, end: DateTime },
    game: {
        id: string;
        name: string;
        isTeamGame: boolean;
    },
    deployedChallengeCount: number;
    hasTickets: boolean;
    isLateStart: boolean;
    score: number;
}

export interface GetSiteOverviewStatsResponse {
    activeCompetitiveChallenges: number;
    activePracticeChallenges: number;
    activeCompetitiveTeams: number;
    registeredUsers: number;
}

export interface SendAnnouncement {
    contentMarkdown: string;
    title?: string;
    teamId?: string;
}
