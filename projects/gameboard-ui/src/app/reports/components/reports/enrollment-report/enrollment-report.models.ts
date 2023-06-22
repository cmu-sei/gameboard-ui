import { ChallengeResult } from "@/api/board-models";
import { SimpleEntity } from "@/api/models";
import { ReportDateRange } from "@/reports/reports-models";

export interface EnrollmentReportFlatParameters {
    enrollDateStart?: string;
    enrollDateEnd?: string;
    seasons: string
    series: string;
    sponsors: string;
    tracks: string;
}

export interface EnrollmentReportParameters {
    enrollDate?: ReportDateRange;
    seasons: string[];
    series: string[];
    sponsors: SimpleEntity[];
    tracks: string[];
}

export interface EnrollmentReportParametersUpdate {
    seasons?: string[];
    series?: string[];
    sponsors?: SimpleEntity[];
    tracks?: string[];
}

export interface EnrollmentReportSponsorViewModel {
    id: string;
    name: string;
    logoFileName: string;
}

export interface EnrollmentReportRecord {
    player: {
        id: string;
        name: string;
        enrollDate?: Date;
        sponsor: EnrollmentReportSponsorViewModel
    },
    game: {
        id: string;
        name: string;
        isTeamGame: boolean;
        series: string;
        season: string;
        track: string;
    },
    enrollDate?: Date,
    session: {
        start?: Date;
        end?: Date;
        durationMs?: number;
    },
    team: {
        id: string;
        name: string;
        currentCaptain: SimpleEntity;
        sponsors: EnrollmentReportSponsorViewModel[];
    },
    challenges: {
        name: string;
        specId: string;
        deployDate?: Date;
        startDate?: Date;
        endDate?: Date;
        durationMs?: number;
        result: ChallengeResult;
        maxPossiblePoints: number;
        score?: number;
    }[],
    challengesPartiallySolvedCount: number,
    challengesCompletelySolvedCount: number,
    score?: number;
}
