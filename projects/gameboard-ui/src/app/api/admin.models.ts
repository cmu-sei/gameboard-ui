import { DateTime } from "luxon";
import { GameEngineType } from "./spec-models";
import { DateTimeRange, SimpleEntity } from "./models";

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

export interface GetPlayersCsvExportResponsePlayer {
    id: string;
    name: string;
    game: SimpleEntity;
    rank?: number;
    score?: number;
    session: DateTimeRange;
    solvesCorrectCount: number;
    solvesPartialCount: number;
    team: SimpleEntity;
    timeMs: number;
    user: SimpleEntity;
}

export interface GetPlayersCsvExportResponse {
    players: GetPlayersCsvExportResponsePlayer[];
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

export interface UpdatePlayerNameChangeRequest {
    approvedName: string;
    requestedName: string;
    status: string;
}
