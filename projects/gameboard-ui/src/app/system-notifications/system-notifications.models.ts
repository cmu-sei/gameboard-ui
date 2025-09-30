// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SimpleEntity } from "../api/models";

export type SystemNotificationType = "generalInfo" | "warning" | "emergency";

export interface CreateEditSystemNotification {
    id?: string;
    title: string;
    isDismissible?: boolean;
    markdownContent: string;
    startsOn?: Date;
    endsOn?: Date;
    notificationType?: SystemNotificationType;
}

export interface ViewSystemNotification {
    id: string;
    title: string;
    isDismissible: boolean;
    markdownContent: string;
    startsOn?: Date;
    endsOn?: Date;
    notificationType: SystemNotificationType;
    createdBy: SimpleEntity;
}

export interface AdminViewSystemNotification extends ViewSystemNotification {
    calloutViewCount: number;
    fullViewCount: number;
}
