import { FeedbackQuestion } from "@/api/feedback-models";
import { SimpleEntity } from "@/api/models";
import { DateTime } from "luxon";

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

export interface FeedbackQuestionsConfig {
    questions: FeedbackQuestion[];
}

export type FeedbackSubmissionAttachedEntityType = "challengeSpec" | "game";

export interface FeedbackSubmissionAttachedEntity {
    id: string;
    entityType: FeedbackSubmissionAttachedEntityType;
}

export interface FeedbackSubmissionUpsert {
    attachedEntity: FeedbackSubmissionAttachedEntity;
    isFinalized: boolean;
    responses: FeedbackQuestion[];
    feedbackTemplateId: string;
    userId?: string;
}

export interface FeedbackSubmissionView {
    id: string;
    attachedEntity: FeedbackSubmissionAttachedEntity;
    feedbackTemplate: SimpleEntity;
    responses: FeedbackQuestion[];
    user: SimpleEntity;
    whenCreated: DateTime;
    whenEdited?: DateTime;
    whenFinalized?: DateTime;
}

export interface FeedbackTemplateView {
    id: string;
    content: string;
    createdBy: SimpleEntity;
    helpText?: string;
    name: string;
    responseCount: number;
}

export interface GetFeedbackSubmissionRequest {
    userId: string;
    entityId: string;
    entityType: FeedbackSubmissionAttachedEntityType;
}

export interface ListFeedbackTemplatesResponse {
    templates: FeedbackTemplateView[];
}
