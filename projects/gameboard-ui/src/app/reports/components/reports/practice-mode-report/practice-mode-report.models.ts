import { ChallengeResult } from "@/api/board-models";
import { PagingArgs, SimpleEntity } from "@/api/models";
import { ReportDateRange, ReportGame, ReportSponsor, ReportTeam } from "@/reports/reports-models";

export enum PracticeModeReportGrouping {
    challenge = "challenge",
    player = "player",
    playerModePerformance = "player-mode-performance"
}

export interface PracticeModeReportOverallStats {
    attemptCount: number;
    challengeCount: number;
    completionCount: number;
    playerCount: number;
    sponsorCount: number;
}

export interface PracticeModeReportFlatParameters {
    practiceDateStart?: string;
    practiceDateEnd?: string;
    games?: string;
    seasons?: string;
    series?: string;
    sponsors?: string;
    tracks?: string;
    pageNumber?: number;
    pageSize?: number;
    grouping: PracticeModeReportGrouping;
}

export interface PracticeModeReportRecord { }

export interface PracticeModeReportByUserRecord extends PracticeModeReportRecord {
    user: {
        id: string,
        name: string,
        sponsor: ReportSponsor,
        hasScoringAttempt: boolean,
    };
    challenge: {
        id: string;
        name: string;
        game: ReportGame;
        maxPossibleScore: number;
    };
    attempts: {
        player: SimpleEntity;
        team?: ReportTeam;
        sponsor: ReportSponsor;
        start: Date,
        end?: Date,
        durationMs?: number;
        result: ChallengeResult;
        score?: number;
        partiallyCorrectCount?: number;
        fullyCorrectCount?: number;
    }[]
}

export interface PracticeModeReportByChallengeRecord extends PracticeModeReportRecord {
    id: string;
    name: string;
    game: ReportGame;
    maxPossibleScore: number;
    avgScore: number;
    description: string;
    text: string;
    sponsorsPlayed: ReportSponsor[];
    overallPerformance: PracticeModeReportByChallengePerformance;
    performanceBySponsor: PracticeModeReportSponsorPerformance[];
}

export interface PracticeModeReportSponsorPerformance {
    sponsor: ReportSponsor;
    performance: PracticeModeReportByChallengePerformance;
}

export interface PracticeModeReportByChallengePerformance {
    players: SimpleEntity[];
    totalAttempts: number;
    scoreHigh: number;
    scoreAvg: number;
    completeSolves: number;
    percentageCompleteSolved: number;
    partialSolves: number;
    percentagePartiallySolved: number;
    zeroScoreSolves: number;
    percentageZeroScoreSolved: number;
}

export interface PracticeModeReportByPlayerModePerformanceRecord {
    player: SimpleEntity;
    sponsor: ReportSponsor;
    practiceStats?: PracticeModeReportByPlayerModePerformanceModeSummary;
    competitiveStats?: PracticeModeReportByPlayerModePerformanceModeSummary;
}

export interface PracticeModeReportByPlayerModePerformanceModeSummary {
    lastAttemptDate?: Date;
    totalChallengesPlayed: number;
    zeroScoreSolves: number;
    partialSolves: number;
    completeSolves: number;
    avgPctAvailablePointsScored: number;
    avgScorePercentile: number;
}

export interface PracticeModeReportPlayerModeSummary {
    player: {
        id: string,
        name: string,
        sponsor: ReportSponsor,
    };
    challenges: PracticeModeReportPlayerModeSummaryChallenge[];
}

export interface PracticeModeReportPlayerModeSummaryChallenge {
    challengeSpec: SimpleEntity,
    game: ReportGame,
    score: number;
    maxPossibleScore: number;
    result: ChallengeResult;
    pctAvailablePointsEarned: number;
    scorePercentile: number;
}
