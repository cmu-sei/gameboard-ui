import { SimpleEntity } from "../api/models";

export interface Report {
    id: string;
    name: string;
    key: string;
    description: string;
    parameters: ReportParameter[]
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
    dateStart: Date;
    dateEnd: Date;
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
