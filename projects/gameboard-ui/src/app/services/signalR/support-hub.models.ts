// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SimpleEntity } from "@/api/models";

export interface SupportHubEvent<T> {
    data: T;
    eventType: SupportHubEventType;
}

export enum SupportHubEventType {
    TicketClosed = "ticketClosed",
    TicketCreated = "ticketCreated",
    TicketUpdatedBySupport = "ticketUpdatedBySupport",
    TicketUpdatedByUser = "ticketUpdatedByUser"
}

export interface SupportHubTicket {
    id: string;
    key: string;
    summary: string;
    description: string;
    status: string;
    createdBy: SimpleEntity;
}

export interface TicketClosedEvent {
    ticket: SupportHubTicket;
    closedBy: SimpleEntity;
}

export interface TicketCreatedEvent {
    ticket: SupportHubTicket;
}

export interface TicketUpdatedBySupportEvent {
    ticket: SupportHubTicket;
    updatedBy: SimpleEntity;
}

export interface TicketUpdatedByUserEvent {
    ticket: SupportHubTicket;
    updatedBy: SimpleEntity;
}
