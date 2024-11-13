import { SimpleEntity } from "@/api/models";

export interface CreateFeedbackTemplate {
    name: string;
    helpText?: string;
    content: string;
}

export interface EditTeedbackTemplate {
    id: string;
    helpText?: string;
    name: string;
    content: string;
}

export interface FeedbackTemplateView {
    id: string;
    content: string;
    createdBy: SimpleEntity;
    helpText?: string;
    name: string;
    responseCount: number;
}

export interface ListFeedbackTemplatesResponse {
    templates: FeedbackTemplateView[];
}
