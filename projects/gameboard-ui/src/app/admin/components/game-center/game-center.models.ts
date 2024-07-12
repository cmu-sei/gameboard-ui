import { DateTime } from "luxon";
import { PagedArray, SimpleSponsor } from "@/api/models";
import { Score } from "@/services/scoring/scoring.models";

export type GameCenterTeamsAdvancementFilter = "advancedFromPreviousGame" | "advancedToNextGame"
export type GameCenterTeamsSort = "name" | "rank" | "timeRemaining" | "timeSinceStart";
export type GameCenterTeamSessionStatus = "complete" | "notStarted" | "playing";

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
    hasScoreboard: boolean;
    isExternal: boolean;
    isLive: boolean;
    isPractice: boolean;
    isRegistrationActive: boolean;
    isTeamGame: boolean;
    stats: {
        playerCountActive: number;
        playerCountTotal: number;
        teamCountActive: number;
        teamCountNotStarted: number;
        teamCountTotal: number;
        topScore?: number;
        topScoreTeamName?: string;
    };

    challengeCount: number;
    openTicketCount: number;
    pointsAvailable: number;
}

export interface GameCenterTeamsRequestArgs {
    advancement?: GameCenterTeamsAdvancementFilter;
    search?: string;
    sessionStatus?: GameCenterTeamSessionStatus;
    sort: GameCenterTeamsSort;
}

export interface GameCenterTeamsResults {
    playerCountActive: number;
    playerCountTotal: number;
    teamCountActive: number;
    teamCountTotal: number;
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
    registeredOn: number;
    score: Score;
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
