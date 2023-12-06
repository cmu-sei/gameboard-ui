import { ChallengeResult } from "@/api/board-models";
import { PagingArgs, SimpleEntity } from "@/api/models";
import { ReportDateRange, ReportGame, ReportSponsor } from "@/reports/reports-models";

export type EnrollmentReportTab = "summary" | "trend" | "game";

export interface EnrollmentReportFlatParameters {
    enrollDateStart?: string;
    enrollDateEnd?: string;
    pageNumber?: number;
    pageSize?: number;
    seasons?: string
    series?: string;
    sponsors?: string;
    tab?: EnrollmentReportTab;
    tracks?: string;
}

export interface EnrollmentReportParameters {
    enrollDate?: ReportDateRange;
    paging: PagingArgs;
    seasons: string[];
    series: string[];
    sponsors: SimpleEntity[];
    tab?: EnrollmentReportTab;
    tracks: string[];
}

export interface EnrollmentReportSponsorViewModel {
    id: string;
    name: string;
    logoFileName: string;
}

export interface EnrollmentReportRecord {
    player: {
        id: string;
        name: string;
        enrollDate?: Date;
        sponsor?: EnrollmentReportSponsorViewModel
    },
    game: ReportGame,
    playTime: {
        start?: Date;
        end?: Date;
        durationMs?: number;
    },
    team: {
        id: string;
        name: string;
        currentCaptain: SimpleEntity;
        sponsors: EnrollmentReportSponsorViewModel[];
    },
    challenges: {
        name: string;
        specId: string;
        deployDate?: Date;
        startDate?: Date;
        endDate?: Date;
        durationMs?: number;
        result: ChallengeResult;
        manualChallengeBonuses: { description: string, points: number }[],
        maxPossiblePoints: number;
        score?: number;
    }[],
    challengesPartiallySolvedCount: number,
    challengesCompletelySolvedCount: number,
    score?: number;
}

export interface EnrollmentReportByGameRecord {
    game: EnrollmentReportByGameGame;
    playerCount: number;
    sponsors: EnrollmentReportByGameSponsor[];
    topSponsor: EnrollmentReportByGameSponsor;
}

export interface EnrollmentReportByGameGame extends ReportGame {
    executionOpen: Date;
    executionClosed: Date;
    registrationOpen: Date;
    registrationClosed: Date;
}

export interface EnrollmentReportByGameSponsor {
    id: string;
    name: string;
    logoFileName: string;
    playerCount: string;
}

export interface EnrollmentReportStatSummary {
    distinctGameCount: number;
    distinctPlayerCount: number;
    distinctSponsorCount: number;
    distinctTeamCount: number;
    sponsorWithMostPlayers?: {
        sponsor: ReportSponsor,
        distinctPlayerCount: number;
    }
}

export interface EnrollmentReportLineChartGroup {
    totalCount: number;
    players: {
        id: string;
        name: string;
        game: SimpleEntity,
        enrollDate: Date
    }[];
}
