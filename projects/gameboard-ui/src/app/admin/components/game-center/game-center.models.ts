import { DateTime } from "luxon";
import { PagedArray, SimpleEntity, SimpleSponsor } from "@/api/models";
import { Score } from "@/services/scoring/scoring.models";
import { ChallengeResult } from "@/api/board-models";

export type GameCenterPracticeSessionStatus = "playing" | "notPlaying";
export type GameCenterPracticeSort = "attemptCount" | "name";

export type GameCenterTab = "settings" | "challenges" | "teams" | "deployment" | "practice" | "observe" | "tickets" | "scoreboard";
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
    isPublished: boolean;
    isRegistrationActive: boolean;
    isTeamGame: boolean;
    stats: {
        attemptCountPractice: number;
        playerCountActive: number;
        playerCountCompetitive: number;
        playerCountPractice: number;
        playerCountTotal: number;
        teamCountActive: number;
        teamCountCompetitive: number;
        teamCountComplete: number;
        teamCountPractice: number;
        teamCountNotStarted: number;
        teamCountTotal: number;
        topScore?: number;
        topScoreTeamName?: string;
    };

    challengeCount: number;
    openTicketCount: number;
    totalTicketCount: number;
    pointsAvailable: number;
}

export interface GameCenterPracticeContext {
    game: SimpleEntity;
    users: GameCenterPracticeContextUser[];
}

export interface GameCenterPracticeChallengeSpec {
    id: string;
    name: string;
    tag?: string;
    activeAttempt: {
        attemptTimestamp: number;
        result: ChallengeResult;
        score: number;
    }
    attemptCount: number;
    lastAttemptDate?: number;
    bestAttempt?: {
        attemptTimestamp: number;
        result: ChallengeResult;
        score: number;
    }
}

export interface GameCenterPracticeContextUser {
    id: string;
    name: string;
    sponsor: SimpleSponsor;
    totalAttempts: number;
    activeChallenge?: SimpleEntity;
    activeChallengeEndTimestamp?: number;
    uniqueChallengeSpecs: number;
    activeTeamId?: string;
    challengeSpecs: GameCenterPracticeChallengeSpec[]
}

export interface GameCenterTeamsRequestArgs {
    advancement?: GameCenterTeamsAdvancementFilter;
    searchTerm?: string;
    sessionStatus?: GameCenterTeamSessionStatus;
    sort?: GameCenterTeamsSort;
}

export interface GameCenterTeamsResults {
    playerCountActive: number;
    playerCountTotal: number;
    teamCountActive: number;
    teamCountTotal: number;
    namesPendingApproval: number;
    teams: PagedArray<GameCenterTeamsResultsTeam>;
}

export interface GameCenterTeamsResultsTeam {
    id: string;
    name: string;

    advancement?: {
        fromGame: SimpleEntity;
        fromTeam: SimpleEntity;
        score: number;
    }
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
    pendingName?: string;
    isReady: boolean;
    sponsor: SimpleSponsor;
    userId: string;
}

export interface GameCenterTeamsSession {
    start?: number;
    end?: number;
    timeCumulativeMs?: number;
    timeRemainingMs?: number;
    timeSinceStartMs?: number;
}

export type GameCenterTeamsStatus = "complete" | "notStarted" | "playing";

export interface GetGameCenterPracticeContextRequest {
    searchTerm?: string;
    sessionStatus?: GameCenterPracticeSessionStatus;
    sort?: GameCenterPracticeSort;
}
