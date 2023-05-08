import { SimpleEntity } from "projects/gameboard-ui/src/app/api/models";
import { ReportDateRange, ReportMetaData, ReportResults } from "../../../reports-models";

export interface SupportReportParameters {
    challengeSpecId?: string;
    gameId?: string;
    hoursSinceOpen?: number;
    hoursSinceStatusChange?: number;
    openedDateRange: ReportDateRange;
    openedTimeWindow?: SupportReportTicketWindow;
    status?: string;
}

export interface SupportReportFlatParameters {
    challengeSpecId?: string;
    gameId?: string;
    hoursSinceOpen?: number;
    hoursSinceStatusChange?: number;
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
