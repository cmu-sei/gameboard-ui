import { SimpleEntity } from "../../../../api/models";
import { ReportDateRange, ReportTrackParameter, ReportTrackParameterModifier } from "../../../reports-models";
import { ReportGameChallengeSpec } from "../../parameters/parameter-game-challengespec/parameter-game-challengespec.component";

export class PlayersReportParameters {
    gameChallengeSpec: ReportGameChallengeSpec = {};
    series?: string;
    sessionStartWindow?: ReportDateRange;
    sponsorId?: string;
    track?: ReportTrackParameter;
}

export class PlayersReportFlatParameters {
    challengeSpecId?: string;
    series?: string;
    gameId?: string;
    playerSessionStartBeginDate?: Date;
    playerSessionStartEndDate?: Date;
    sponsorId?: string;
    trackModifier?: ReportTrackParameterModifier;
    trackName?: string;
}

export interface PlayersReportGamesAndChallengesSummary {
    enrolled: SimpleEntity[];
    deployed: SimpleEntity[];
    scoredPartial: SimpleEntity[];
    scoredComplete: SimpleEntity[];
}

export interface PlayersReportRecord {
    user: SimpleEntity;
    challenges: PlayersReportGamesAndChallengesSummary,
    games: PlayersReportGamesAndChallengesSummary,
    tracksPlayed: string[],
    competitionsPlayed: string[]
}
