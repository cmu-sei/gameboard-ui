import { SimpleEntity } from "@/api/models";
import { ReportDateRange } from "@/reports/reports-models";

export interface EnrollmentReportFlatParameters {
    enrollDateStart?: Date;
    enrollDateEnd?: Date;
    seasons: string[]
    series: string[];
    sponsors: SimpleEntity[];
    tracks: string[];
}

export interface EnrollmentReportParameters {
    enrollDate?: ReportDateRange;
    seasons: string[];
    series: string[];
    sponsors: SimpleEntity[];
    tracks: string[];
}

export interface EnrollmentReportRecord {
    name: string;
    teamName?: string;
    enrollmentDate: Date;
    game: string;
    sessionsLaunched: number;
    challengesAttempted: number;
    challengesSolvedPartial: number;
    challengesSolvedFull: number;
    score: number;
}
