import { SimpleEntity } from "../../../../api/models";
import { ReportMetaData } from "../../../reports-models";

export interface ChallengesReportArgs {
    challengeSpecId?: string;
    competition?: string;
    gameId?: string;
    track?: string;
}

export interface ChallengesReportModel {
    metaData: ReportMetaData,
    records: {
        challengeSpec: SimpleEntity;
        game: SimpleEntity;
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
    }[]
}
