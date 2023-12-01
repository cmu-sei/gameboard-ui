import { SimpleEntity } from "./models";

export type SystemNotificationType = "generalInfo" | "warning" | "emergency";

export interface CreateEditSystemNotification {
    id?: string;
    title: string;
    markdownContent: string;
    startsOn?: Date;
    endsOn?: Date;
    notificationType?: SystemNotificationType;
}

export interface ViewSystemNotification {
    id: string;
    title: string;
    markdownContent: string;
    startsOn?: Date;
    endsOn?: Date;
    notificationType: SystemNotificationType;
    createdBy: SimpleEntity;
}
