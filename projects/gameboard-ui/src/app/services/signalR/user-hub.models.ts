import { SimpleEntity } from "@/api/models";

export type UserHubEventType = "announcement";

export interface UserHubEvent<T> {
    data: T;
    eventType: UserHubEventType;
}

export interface UserHubAnnouncement {
    sentByUser: SimpleEntity;
    contentMarkdown: string;
    title: string;
}
