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
