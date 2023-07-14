import { PagingArgs, SimpleEntity } from "@/api/models";
import { ReportDateRange, ReportGame, ReportSponsor, ReportTeam } from "@/reports/reports-models";

export enum PracticeModeReportGrouping {
    challenge = "challenge",
    player = "player",
    practiceVersusCompetitive = "practice-versus-competitive"
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

export interface PracticeModeReportParameters {
    practiceDate: ReportDateRange,
    games: SimpleEntity[],
    seasons: string[],
    series: string[],
    sponsors: ReportSponsor[],
    tracks: string[],
    paging: PagingArgs,
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
        start?: Date,
        end?: Date,
        durationMs?: number;
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
    playerCount: number;
    totalAttempts: number;
    completeSolves: number;
    percentageCompleteSolved: number;
    partialSolves: number;
    percentagePartiallySolved: number;
    zeroScoreSolves: number;
    percentageZeroScoreSolved: number;
}
