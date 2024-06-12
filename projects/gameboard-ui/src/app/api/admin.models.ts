import { DateTime } from "luxon";
import { GameEngineType } from "./spec-models";
import { PagedArray, SimpleEntity, SimpleSponsor } from "./models";

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

export interface GameCenterContext {
    id: string;
    name: string;
    logo?: string;
    competition: string | null;
    season: string | null;
    track: string | null;
    executionWindow: {
        start: DateTime,
        end: DateTime
    },
    isExternal: boolean;
    isLive: boolean;
    isPractice: boolean;
    isRegistrationActive: boolean;
    isTeamGame: boolean;

    challengeCount: number;
    openTicketCount: number;
    pointsAvailable: number;
}

export interface GameCenterTeamsResults {
    teams: PagedArray<GameCenterTeamsResultsTeam>;
}

export interface GameCenterTeamsResultsTeam {
    id: string;
    name: string;

    captain: GameCenterTeamsPlayer;
    challengesCompleteCount: number;
    challengesPartialCount: number;
    challengesRemainingCount: number;
    isExtended: boolean;
    isReady: boolean;
    players: GameCenterTeamsPlayer[];
    rank?: number;
    registeredOn?: DateTime;
    session: GameCenterTeamsSession;
    ticketCount: number;
}

export interface GameCenterTeamsPlayer {
    id: string;
    name: string;
    isReady: boolean;
    sponsor: SimpleSponsor;
}

export interface GameCenterTeamsSession {
    start?: number;
    end?: number;
    timeRemainingMs?: number;
    timeSinceStartMs?: number;
}

export type GameCenterTeamsStatus = "complete" | "notStarted" | "playing";

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
