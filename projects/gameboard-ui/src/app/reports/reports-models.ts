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
    SupportReport = "support"
}

export interface ReportSponsor {
    id: string;
    name: string;
    logoUri: string;
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
