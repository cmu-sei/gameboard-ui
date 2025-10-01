// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DateTime } from "luxon";

export interface GetPracticeChallengeGroupsUserDataRequest {
    challengeGroupIds: string[];
    userId: string;
}

export interface GetPracticeChallengeGroupsUserDataResponse {
    groups: GetPracticeChallengeGroupsUserDataResponseGroup[];
}

export interface GetPracticeChallengeGroupsUserDataResponseGroup {
    id: string;
    name: string;
    challengeCount: number;
    challengeMaxScoreTotal: number;
    challenges: GetPracticeChallengeGroupsUserDataResponseChallenge[];
    userData?: GetPracticeChallengeGroupsUserDataResponseUserData;
}

export interface GetPracticeChallengeGroupsUserDataResponseChallenge {
    id: string;
    name: string;
    hasCertificateTemplate: boolean;
    maxPossibleScore: number;
    bestAttempt?: GetPracticeChallengeGroupsUserDataChallengeAttempt;
}

export interface GetPracticeChallengeGroupsUserDataChallengeAttempt {
    certificateAwarded: boolean;
    date: DateTime;
    score: number;
}

export interface GetPracticeChallengeGroupsUserDataResponseUserData {
    challengesCompleteCount: number;
    score: number;
}
