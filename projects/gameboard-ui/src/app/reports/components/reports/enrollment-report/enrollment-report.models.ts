// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DateTime } from "luxon";
import { ChallengeResult } from "@/api/board-models";
import { SimpleEntity } from "@/api/models";
import { ReportGame, ReportSponsor } from "@/reports/reports-models";

export type EnrollmentReportTab = "summary" | "trend" | "game";

export interface EnrollmentReportFlatParameters {
    enrollDateStart?: string;
    enrollDateEnd?: string;
    pageNumber?: number;
    pageSize?: number;
    seasons?: string
    series?: string;
    sponsors?: string;
    tab?: EnrollmentReportTab;
    tracks?: string;
}

export interface EnrollmentReportRecord {
    player: {
        id: string;
        name: string;
        enrollDate?: Date;
        sponsor?: ReportSponsor
    },
    game: ReportGame,
    playTime: {
        start?: Date;
        end?: Date;
        durationMs?: number;
    },
    team: {
        id: string;
        name: string;
        currentCaptain: SimpleEntity;
        sponsors: ReportSponsor[];
    },
    challenges: {
        name: string;
        specId: string;
        deployDate?: Date;
        startDate?: Date;
        endDate?: Date;
        durationMs?: number;
        result: ChallengeResult;
        manualChallengeBonuses: { description: string, points: number }[],
        maxPossiblePoints: number;
        score?: number;
    }[],
    challengesPartiallySolvedCount: number,
    challengesCompletelySolvedCount: number,
    score?: number;
}

export interface EnrollmentReportByGameRecord {
    game: EnrollmentReportByGameGame;
    playerCount: number;
    sponsors: EnrollmentReportByGameSponsor[];
    topSponsor: EnrollmentReportByGameSponsor;
}

export interface EnrollmentReportByGameGame extends ReportGame {
    executionOpen: Date;
    executionClosed: Date;
    registrationOpen: Date;
    registrationClosed: Date;
}

export interface EnrollmentReportByGameSponsor {
    id: string;
    name: string;
    logoFileName: string;
    playerCount: number;
}

export interface EnrollmentReportStatSummary {
    distinctGameCount: number;
    distinctPlayerCount: number;
    distinctSponsorCount: number;
    distinctTeamCount: number;
    sponsorWithMostPlayers?: {
        sponsor: ReportSponsor,
        distinctPlayerCount: number;
    }
    playersWithNoSessionCount: number;
    playersWithNoStartedChallengeCount: number;
    teamsWithNoSessionCount: number;
    teamsWithNoStartedChallengeCount: number;
}

export interface EnrollmentReportLineChartResponse {
    byDate: { [dateString: string]: number }
    byGameByDate: {
        [gameId: string]: {
            [dateString: string]: number;
        }
    }
    games: { [gameId: string]: string };
    // players: { [playerId: string]: EnrollmentReportLineChartPlayer }
    periodType: string;
    periodStart: DateTime;
    periodEnd: DateTime;
}

// these are client side models that represents the data after it's been structured from the API
export interface EnrollmentReportLineChartViewModel {
    byDate: Map<DateTime, number>;
    byGameByDate: Map<string, Map<DateTime, number>>;
    gameNames: { [gameId: string]: string };
}
