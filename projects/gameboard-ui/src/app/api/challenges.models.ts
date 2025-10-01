// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DateTime } from "luxon";
import { SimpleEntity } from "./models";
import { PlayerMode } from "./player-models";

export interface ChallengeSolutionGuide {
    challengeSpecId: string;
    showInCompetitiveMode: boolean;
    url: string;
}

export interface GetUserActiveChallengesResponse {
    user: SimpleEntity;
    challenges: UserActiveChallenge[];
}

export interface UserActiveChallenge {
    id: string;
    name: string;
    spec: SimpleEntity;
    endsAt?: number;
    mode: PlayerMode;
    feedbackTemplateId?: string;
    game: SimpleEntity;
    team: SimpleEntity;
    isDeployed: boolean;
    markdown?: string;
    scoreAndAttemptsState: {
        attempts: number;
        maxAttempts?: number;
        score: number;
        maxPossibleScore: number;
    };
    vms: UserActiveChallengeVm[];
}

export interface UserActiveChallengeVm {
    id: string;
    name: string;
}

export interface ChallengeProgressResponse {
    progress: ChallengeProgressView;
    spec: SimpleEntity;
    team: SimpleEntity;
}

export interface ChallengeProgressView {
    id: string;
    attempts: number;
    expiresAtTimestamp: number;
    lastScoreTime?: DateTime;
    maxAttempts: number;
    maxPoints: number;
    nextSectionPreReqThisSection?: number;
    nextSectionPreReqTotal?: number;
    score: number;
    text: string;
    variant: {
        text: string;
        totalSectionCount: number;
        sections: ChallengeProgressViewSection[];
    }
}

export interface ChallengeProgressViewSection {
    name?: string;
    preReqPrevSection: number;
    preReqTotal: number;
    score: number;
    scoreMax: number;
    text?: string;
    totalWeight: number;
    questions: {
        answer: string;
        example?: string;
        hint?: string;
        isCorrect: boolean;
        isGraded: boolean;
        scoreCurrent: number;
        scoreMax: number;
        weight: number;
    }[]
}

export interface ChallengeSubmissionAnswers {
    questionSetIndex: number;
    answers: string[];
}

export interface ChallengeSubmissionViewModelLegacy {
    sectionIndex: number;
    answers: string[];
    submittedOn: Date;
}

export interface ChallengeSubmissionHistory {
    challengeId: string;
    teamId: string;
    sectionSubmissions: {
        [sectionIndex: number]: {
            answers: string[];
            submittedAt: number;
        }[]
    }
}

export interface GetChallengeSubmissionsResponseLegacy {
    challengeId: string;
    teamId: string;
    pendingAnswers: ChallengeSubmissionAnswers | null;
    submittedAnswers: ChallengeSubmissionViewModelLegacy[];
}
