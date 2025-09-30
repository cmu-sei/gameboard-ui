// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DateTime } from "luxon";
import { FeedbackQuestion } from "@/api/feedback-models";
import { SimpleEntity, SimpleSponsor } from "@/api/models";
import { FeedbackSubmissionAttachedEntity } from "@/feedback/feedback.models";
import { ReportSponsor } from "@/reports/reports-models";

export interface FeedbackReportParameters {
    templateId: string;
    games?: string;
    seasons?: string;
    sponsors?: string;
    series?: string;
    sort?: string;
    submissionDateStart?: DateTime;
    submissionDateEnd?: DateTime;
    tracks?: string;
}

export interface FeedbackReportRecord {
    id: string;
    entity: FeedbackSubmissionAttachedEntity;
    challengeSpec?: SimpleEntity;
    logicalGame: FeedbackReportRecordGame;
    responses: FeedbackQuestion[];
    sponsor: ReportSponsor;
    user: SimpleEntity;
    whenCreated: DateTime;
    whenEdited?: DateTime;
    whenFinalized?: DateTime;
}

export interface FeedbackReportRecordGame {
    id: string;
    name: string;
    division: string;
    season: string;
    series: string;
    track: string;
    isTeamGame: boolean;
}

export interface FeedbackReportStatSummary {
    questionCount?: number;
    responseCount: number;
    unfinalizedCount: number;
    uniqueChallengesCount: number;
    uniqueGamesCount: number;
}
