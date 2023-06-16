import { SimpleEntity } from "../api/models";

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
    records: T[]
}

export interface ReportMetaData {
    key: string;
    title: string;
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
    ChallengesReport = "challenges-report",
    EnrollmentReport = "enrollment",
    PlayersReport = "players-report",
    SupportReport = "support-report"
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
