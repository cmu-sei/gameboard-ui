import { SimpleEntity } from "@/api/models";

export interface FeedbackTemplateView {
    id: string;
    content: string;
    createdBy: SimpleEntity;
    name: string;
    responseCount: number;
}

export interface GetFeedbackTemplatesResponse {
    challengeTemplates: FeedbackTemplateView[];
    gameTemplates: FeedbackTemplateView[];
}
