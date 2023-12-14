import { PagingArgs, SimpleEntity } from "@/api/models";
import { ReportDateRange, ReportSponsor } from "@/reports/reports-models";

export interface PlayersReportFlatParameters {
    createdDateStart?: string;
    createdDateEnd?: string;
    lastPlayedDateStart?: string;
    lastPlayedDateEnd?: string;
    pageNumber?: number;
    pageSize?: number;
    sponsors?: string;
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
