// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DateTime } from "luxon";
import { SimpleEntity, SimpleSponsor } from "@/api/models";
import { PlayerMode } from "@/api/player-models";

export interface SiteUsageReport {
    avgCompetitiveChallengesPerCompetitiveUser: number;
    avgPracticeChallengesPerPracticeUser: number;
    competitiveUsersWithNoPracticeCount: number;
    deployedChallengesCount: number;
    deployedChallengesCompetitiveCount: number;
    deployedChallengesPracticeCount: number;
    deployedChallengesSpecCount: number;
    competitivePlayDurationHours: number;
    practicePlayDurationHours: number;
    practiceUsersWithNoCompetitiveCount: number;
    sponsorCount: number;
    userCount: number;
}

export interface SiteUsageReportFlatParameters {
    sponsors?: string;
    startDate?: string;
    endDate?: string;
}

export interface SiteUsageReportPlayersModalParameters {
    exclusiveToMode?: PlayerMode;
}

export interface SiteUsageReportChallenge {
    id: string;
    name: string;
    deployCount: number;
    solveCompleteCount: number;
    solvePartialCount: number;
    usedInGames: SimpleEntity[];
}

export interface SiteUsageReportPlayer {
    name: string;
    challengeCountCompetitive: number;
    challengeCountPractice: number;
    lastActive: DateTime;
    sponsor: SimpleSponsor;
    userId: string;
}

export interface SiteUsageReportSponsor {
    id: string;
    name: string;
    logo: string;
    parentName?: string;
    playerCount: number;
}
