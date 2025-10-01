// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DateTime } from "luxon";
import { DateTimeRange, PlayerWithSponsor, SimpleEntity } from "./models";

export interface AdminEnrollTeamRequest {
    gameId: string;
    userIds: string[];
}

export interface AdminEnrollTeamResponse {
    id: string;
    name: string;
    gameId: string;
    players: PlayerWithSponsor;
}

export interface AdminExtendTeamSessionResponse {
    teams: [
        { id: string, sessionEnd: DateTime }
    ]
}

export interface AddToTeamResponse {
    game: SimpleEntity;
    player: SimpleEntity;
    teamId: string;
    user: SimpleEntity;
}

export interface AdvanceTeamsRequest {
    gameId: string;
    includeScores: boolean;
    teamIds: string[];
}

export interface RemoveFromTeamResponse {
    game: SimpleEntity;
    player: SimpleEntity;
    teamId: string;
    user: SimpleEntity;
}

export interface TeamChallengeSpecStatus {
    availabilityRange?: DateTimeRange;
    challengeId?: string;
    score?: number;
    scoreMax: number;
    spec: SimpleEntity;
    state: TeamChallengeSpecStatusState;
}

export interface GetTeamChallengeSpecsStatusesResponse {
    game: SimpleEntity;
    team: SimpleEntity;
    challengeSpecStatuses: TeamChallengeSpecStatus[];
}

export type TeamChallengeSpecStatusState = "notStarted" | "deployed" | "notDeployed" | "ended";

export type TeamSessionResetType = "unenrollAndArchiveChallenges" | "archiveChallenges" | "preserveChallenges";
export interface TeamSessionUpdate {
    id: string;
    sessionEndsAt: number;
}
