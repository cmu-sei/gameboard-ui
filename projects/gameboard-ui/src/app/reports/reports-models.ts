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

export interface ReportMetaData {
    key: ReportKey;
    title: string;
    description: string;
    runAt: Date;
}

export interface ReportDateRange {
    dateStart?: Date;
    dateEnd?: Date;
}

export interface ReportTimeSpan {
    days?: number;
    hours?: number;
    minutes?: number;
}

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

export enum ReportTrackParameterModifier {
    CompetedInThisTrack = "include",
    CompetedInOnlyThisTrack = "include-only",
    DidntCompeteInThisTrack = "exclude"
}

export interface ReportTrackParameter {
    track?: string;
    modifier?: ReportTrackParameterModifier;
}

export interface ReportViewUpdate<TRecord> {
    reportContainerRef?: ElementRef<HTMLDivElement>;
    results: ReportResults<TRecord>;
}
