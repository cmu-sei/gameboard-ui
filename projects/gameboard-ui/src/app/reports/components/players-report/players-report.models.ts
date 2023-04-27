import { SimpleEntity } from "../../../api/models";
import { ReportMetaData, ReportTrackParameter } from "../../reports-models";

export class PlayersReportParameters {
    challengeId?: string;
    competition?: string;
    gameId?: string;
    sponsorId?: string;
    // sessionStartWindow: 
    track?: ReportTrackParameter;
}

export interface PlayersReportGamesAndChallengesSummary {
    countEnrolled: number;
    countDeployed: number;
    countScoredPartial: number;
    countScoredComplete: number;
}

export interface PlayersReportResults {
    metaData: ReportMetaData,
    records: {
        user: SimpleEntity;
        challenges: PlayersReportGamesAndChallengesSummary,
        games: PlayersReportGamesAndChallengesSummary,
        tracksPlayed: string[],
        competitionsPlayed: string[]
    }[];
}
