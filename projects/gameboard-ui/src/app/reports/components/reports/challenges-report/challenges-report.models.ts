import { SimpleEntity } from "@/api/models";
import { PlayerMode } from "@/api/player-models";
import { ReportGame } from "@/reports/reports-models";

export interface ChallengesReportFlatParameters {
    games?: string;
    seasons?: string;
    series?: string;
    tracks?: string;
    pageNumber?: number;
    pageSize?: number;
    startDateStart?: string;
    startDateEnd?: string;
}

export interface ChallengesReportRecord {
    challengeSpec: SimpleEntity;
    game: ReportGame;
    playerModeCurrent: PlayerMode,
    points: number;
    tags: string[];

    avgScore?: number;
    avgCompleteSolveTimeMs?: number;
    deployCompetitiveCount: number;
    deployPracticeCount: number;
    distinctPlayerCount: number;
    solveCompleteCount: number;
    solvePartialCount: number;
    solveZeroCount: number;
}

export interface ChallengesReportStatSummaryPopularChallenge {
    challengeName: string;
    gameName: string;
    deployCount: number;
}

export interface ChallengesReportStatSummary {
    deployCompetitiveCount: number;
    deployPracticeCount: number;
    specCount: number;
    mostPopularCompetitiveChallenge?: ChallengesReportStatSummaryPopularChallenge;
    mostPopularPracticeChallenge?: ChallengesReportStatSummaryPopularChallenge;
}
