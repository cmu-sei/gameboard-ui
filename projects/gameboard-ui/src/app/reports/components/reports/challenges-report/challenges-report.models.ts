import { SimpleEntity } from "../../../../api/models";
import { ReportDateRange, ReportMetaData, ReportTrackParameter } from "../../../reports-models";
import { ReportGameChallengeSpec } from "../../parameters/parameter-game-challengespec/parameter-game-challengespec.component";

export interface ChallengesReportParameters {
    competition?: string;
    dateRange: ReportDateRange,
    gameChallengeSpec: ReportGameChallengeSpec;
    track: ReportTrackParameter;
}

export interface ChallengesReportFlatParameters {
    challengeSpecId?: string;
    competition?: string;
    dateStart?: Date,
    dateEnd?: Date,
    gameId?: string;
    trackName?: string;
}

export interface ChallengesReportRecord {
    challengeSpec: SimpleEntity;
    game: SimpleEntity;
    challenge?: SimpleEntity;
    playersEligible: number;
    playersStarted: number;
    playersWithPartialSolve: number;
    playersWithCompleteSolve: number;
    fastestSolve?: {
        player: SimpleEntity;
        solveTimeMs: number;
    },
    maxPossibleScore: number;
    meanScore?: number;
    meanCompleteSolveTimeMs?: number;
    ticketCount: number;
}

export interface ChallengesReportModel {
    metaData: ReportMetaData,
    records: ChallengesReportRecord[]
}
