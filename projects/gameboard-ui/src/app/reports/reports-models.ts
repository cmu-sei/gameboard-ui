import { ElementRef } from "@angular/core";
import { PagingResults, SimpleEntity } from "../api/models";

export interface ReportViewModel {
    id: string;
    name: string;
    key: string;
    description: string;
    exampleFields: string[];
    exampleParameters: string[];
}

export interface ReportResults<T> {
    metaData: ReportMetaData,
    paging: PagingResults,
    records: T[]
}

export interface ReportResultsWithOverallStats<TOverallStats, TRecord> {
    metaData: ReportMetaData,
    overallStats: TOverallStats,
    paging: PagingResults,
    records: TRecord[]
}

export interface ReportMetaData {
    key: ReportKey;
    title: string;
    description: string;
    runAt: Date;
}

export interface ReportDateRange {
    dateStart: Date | null | undefined;
    dateEnd: Date | null | undefined;
}

export interface ReportTimeSpan {
    days?: number;
    hours?: number;
    minutes?: number;
}

export const timespanToMinutes = (timespan: ReportTimeSpan) => {
    if (!timespan)
        return 0;

    return (timespan.days || 0) * 24 * 60 + (timespan.hours || 0) * 60 + (timespan.minutes || 0);
};

export const minutesToTimeSpan = (minutes: number | undefined | null): ReportTimeSpan => {
    if (!minutes)
        return { days: undefined, hours: undefined, minutes: undefined };

    const minutesInDay = 24 * 60;

    let remainingMinutes = minutes;
    const days = Math.floor(remainingMinutes / minutesInDay);
    remainingMinutes = remainingMinutes % minutesInDay;

    const hours = Math.floor(remainingMinutes / 60);
    remainingMinutes = remainingMinutes % 60;

    return {
        days: days || undefined,
        hours: hours || 0,
        minutes: remainingMinutes
    };
};

export interface ReportParameterOptions {
    challenges: SimpleEntity[];
    competitions: string[];
    games: SimpleEntity[];
    players: SimpleEntity[];
    sponsors: SimpleEntity[];
    teams: SimpleEntity[];
    tracks: string[];
}

export enum ReportKey {
    ChallengesReport = "challenges",
    EnrollmentReport = "enrollment",
    PlayersReport = "players",
    PracticeModeReport = "practice-mode",
    SupportReport = "support"
}

export interface ReportGame {
    id: string;
    name: string;
    isTeamGame: boolean;
    series: string;
    season: string;
    track: string;
}

export interface ReportSponsor {
    id: string;
    name: string;
    logoFileName: string;
}

export interface ReportTeam {
    id: string;
    name: string;
    sponsors: ReportSponsor;
    players: SimpleEntity[];
    captain: SimpleEntity;
}

export interface ReportTrackParameter {
    track?: string;
}

export interface ReportViewUpdate {
    metaData: ReportMetaData;
    pagingResults?: PagingResults;
}
