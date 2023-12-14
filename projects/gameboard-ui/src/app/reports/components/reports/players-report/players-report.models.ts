import { PagingArgs, SimpleEntity } from "@/api/models";
import { ReportDateRange, ReportSponsor } from "@/reports/reports-models";

export interface PlayersReportFlatParameters {
    createdDateStart?: string;
    createdDateEnd?: string;
    games?: string;
    lastPlayedDateStart?: string;
    lastPlayedDateEnd?: string;
    seasons?: string;
    series?: string;
    sponsors?: string;
    tracks?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface PlayersReportParameters {
    createdDate?: ReportDateRange;
    lastPlayedDate?: ReportDateRange;
    sponsors?: SimpleEntity;
    paging: PagingArgs;
}

export interface PlayersReportRecord {
    user: SimpleEntity;
    sponsor: ReportSponsor;
    createdOn?: Date;
    lastPlayedOn?: Date;
    deployedCompetitiveChallengesCount: number;
    deployedPracticeChallengesCount: number;
    distinctGamesPlayedCount: number;
    distinctSeriesPlayedCount: number;
    distinctTracksPlayedCount: number;
    distinctSeasonsPlayedCount: number;
}
