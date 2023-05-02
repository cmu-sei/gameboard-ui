import { ReportDateRange, ReportMetaData, ReportResults } from "../../../reports-models";

export interface SupportReportParameters {
    challengeSpecId?: string;
    gameId?: string;
    hoursSinceOpen?: number;
    hoursSinceStatusChange?: number;
    openedDateRange: ReportDateRange;
    openedTimeWindow?: TicketTimeWindow;
    status?: string;
}

export interface SupportReportFlatParameters {
    challengeSpecId?: string;
    gameId?: string;
    hoursSinceOpen?: number;
    hoursSinceStatusChange?: number;
    openedDateStart?: string;
    openedDateEnd?: string;
    openedTimeWindow?: TicketTimeWindow;
    status?: string;
}

export interface SupportReportRecord {

}

export enum TicketTimeWindow {
    BusinessHours,
    Evening,
    OffHours
}
