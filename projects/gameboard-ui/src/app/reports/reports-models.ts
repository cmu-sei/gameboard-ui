import { SimpleEntity } from "../api/models";

export interface DoughnutChartConfig {
    labels: string[];
    dataSets: { label: string; data: number[]; backgroundColor: string[]; hoverOffset: number; }[];
    options: { responsive: boolean; };
}


export interface ReportViewModel {
    id: string;
    name: string;
    key: string;
    description: string;
    exampleFields: string[];
    exampleParameters: string[];
}

export interface ReportParameter {
    id: string;
    name: string;
    description?: string;
    type: ReportParameterType
}

export enum ReportParameterType {
    Challenge,
    Competition,
    DateRange,
    DateSingle,
    Game,
    Player,
    Sponsor,
    Team,
    Track
}

export interface ReportDateRange {
    dateStart?: Date;
    dateEnd?: Date;
}

export interface ReportParameters {
    challengeId?: string;
    competition?: string;
    dateRange?: ReportDateRange;
    date?: Date;
    gameId?: string;
    playerId?: string;
    sponsorId?: string;
    teamId?: string;
    track?: string;
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

export interface ReportMetaData {
    key: string;
    title: string;
    runAt: Date;
}

export enum ReportKey {
    ChallengesReport = "challenges-report",
    PlayersReport = "players-report"
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
    track: string;
    modifier: ReportTrackParameterModifier;
}
