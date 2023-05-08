import { SimpleEntity } from "../../../../api/models";
import { ReportMetaData, ReportTrackParameter } from "../../../reports-models";

export interface ChallengesReportParameters {
    challengeSpecId?: string;
    competition?: string;
    gameId?: string;
    track?: ReportTrackParameter;
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
