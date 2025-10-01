// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { FeedbackQuestion, FeedbackStats } from "@/api/feedback-models";
import { SimpleEntity } from "@/api/models";

export interface FeedbackReportDetails {
    id?: string;
    userId?: string;
    playerId?: string;
    challengeId?: string;
    challengeSpecId?: string;
    gameId?: string;
    questions: FeedbackQuestion[];
    submitted?: boolean;
    timestamp?: Date;
    approvedName?: string;
    challengeTag?: string;
}

export interface FeedbackGameReportParameters {
    challengeSpecId?: string;
    gameId: string;
}

export interface FeedbackGameReportResponse {
    game: SimpleEntity;
    questions: FeedbackQuestion[];
    stats: FeedbackStats;
}
