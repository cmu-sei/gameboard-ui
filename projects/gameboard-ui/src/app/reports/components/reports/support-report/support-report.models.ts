// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SimpleEntity } from "projects/gameboard-ui/src/app/api/models";

export interface SupportReportFlatParameters {
    challengeSpecId?: string;
    gameId?: string;
    labels?: string;
    minutesSinceOpen?: number;
    minutesSinceUpdate?: number;
    openedDateStart?: string;
    openedDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
    openedTimeWindow?: SupportReportTicketWindow;
    pageNumber?: number;
    pageSize?: number;
    statuses?: string;
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

export interface SupportReportStatSummaryChallengeSpec {
    id: string;
    name: string;
    ticketCount: number;
}

export interface SupportReportStatSummaryLabel {
    label: string;
    ticketCount: number;
}

export interface SupportReportStatSummary {
    allTicketsMostPopularLabel?: SupportReportStatSummaryLabel;
    openTicketsMostPopularLabel?: SupportReportStatSummaryLabel;
    openTicketsCount: number;
    allTicketsCount: number;
    challengeSpecWithMostTickets?: SupportReportStatSummaryChallengeSpec;
}
