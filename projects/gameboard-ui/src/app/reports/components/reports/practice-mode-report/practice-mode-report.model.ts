import { PagingArgs, SimpleEntity } from "@/api/models";
import { ReportDateRange, ReportGame, ReportSponsor, ReportTeam } from "@/reports/reports-models";

export interface PracticeModeReportFlatParameters {
    practiceDateStart?: string;
    practiceDateEnd?: string;
    games?: string;
    series?: string;
    sponsors?: string;
    tracks?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface PracticeModeReportParameters {
    practiceDate?: ReportDateRange,
    games: string[],
    series: string[],
    sponsors: string[],
    tracks: string[],
    paging: PagingArgs,
}

export interface PracticeModeReportRecord {
    user: {
        id: string,
        name: string,
        sponsor: ReportSponsor
    };
    challenge: {
        id: string;
        name: string;
        game: ReportGame;
        maxPossiblePoints: number;
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
    }[],
    competitiveSummary?: {
        avgCompetitivePointsPct?: number;
        competitiveChallengesPlayed?: number;
        competitiveGamesPlayed?: number;
        lastCompetitiveChallengeDate?: Date
    }
}
