import { SimpleEntity } from "@/api/models";
import { ReportSponsor } from "@/reports/reports-models";

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

export interface PlayersReportStatSummary {
    userCount: number;
    usersWithCompletedCompetitiveChallengeCount: number;
    usersWithCompletedPracticeChallengeCount: number;
    usersWithDeployedCompetitiveChallengeCount: number;
    usersWithDeployedPracticeChallengeCount: number;
}
