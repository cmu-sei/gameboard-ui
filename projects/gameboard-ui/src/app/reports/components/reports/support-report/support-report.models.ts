import { SimpleEntity } from "projects/gameboard-ui/src/app/api/models";
import { ReportDateRange, ReportMetaData, ReportResults, ReportTimeSpan } from "../../../reports-models";
import { ReportGameChallengeSpec } from "../../parameters/parameter-game-challengespec/parameter-game-challengespec.component";

export interface SupportReportParameters {
    gameChallengeSpec: ReportGameChallengeSpec;
    challengeSpecId?: string;
    gameId?: string;
    timeSinceOpen?: ReportTimeSpan,
    timeSinceUpdate?: ReportTimeSpan,
    openedDateRange: ReportDateRange;
    openedTimeWindow?: SupportReportTicketWindow;
    status?: string;
}

export interface SupportReportFlatParameters {
    challengeSpecId?: string;
    gameId?: string;
    minutesSinceOpen?: number;
    minutesSinceUpdate?: number;
    openedDateStart?: string;
    openedDateEnd?: string;
    openedTimeWindow?: SupportReportTicketWindow;
    status?: string;
}

export interface SupportReportRecord {
    key: string;
    prefixedKey: string;
    // ticket info
    attachmentUris: string[];
    labels: string[];
    summary: string;
    status: string;
    activityCount: number;
    // game context
    game?: SimpleEntity,
    challenge?: SimpleEntity,
    player?: SimpleEntity;
    // creation/assignment
    createdOn: Date,
    updatedOn?: Date,
    assignedTo?: SimpleEntity,
    createdBy: SimpleEntity,
    requestedBy?: SimpleEntity,
    updatedBy?: SimpleEntity,
}

export enum SupportReportTicketWindow {
    BusinessHours,
    EveningHours,
    OffHours
}
