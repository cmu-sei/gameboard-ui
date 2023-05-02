import { SimpleEntity } from "../../../../api/models";
import { ReportDateRange, ReportMetaData, ReportTrackParameter, ReportTrackParameterModifier } from "../../../reports-models";

export class PlayersReportParameters {
    challengeSpecId?: string;
    competition?: string;
    gameId?: string;
    sponsorId?: string;
    sessionStartWindow?: ReportDateRange;
    track?: ReportTrackParameter;
}

export class PlayersReportFlatParameters {
    challengeSpecId?: string;
    competition?: string;
    gameId?: string;
    sponsorId?: string;
    playerSessionStartBeginDate?: Date;
    playerSessionStartEndDate?: Date;
    trackModifier?: ReportTrackParameterModifier;
    trackName?: string;
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
