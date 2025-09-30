// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ChallengeResult } from "@/api/board-models";
import { SimpleEntity, PlayerWithSponsor } from "@/api/models";
import { DateTime } from "luxon";

export interface GameScoringConfig {
    game: SimpleEntity;
    specs: ChallengeSpecScoringConfig[];
}

export interface ChallengeSpecScoringConfig {
    id: string;
    name: string;
    description: string;
    completionScore: number;
    possibleBonuses: GameScoringConfigChallengeBonus[];
    maxPossibleScore: number;
    supportKey: string;
}

export interface GameScoringConfigChallengeBonus {
    id: string;
    description: string;
    pointValue: number;
}

export interface GameScoringConfigChallengeBonusSolveRank extends GameScoringConfigChallengeBonus {
    solveRank: number;
}

export interface Score {
    advancedScore?: number;
    completionScore: number;
    manualBonusScore: number;
    bonusScore: number;
    totalScore: number;
}

export interface CreateManualChallengeBonus {
    challengeId: string;
    description: string;
    pointValue: number;
}

export interface CreateManualTeamBonus {
    teamId: string;
    description: string;
    pointValue: number;
}

export interface ManualBonus {
    id: string;
    description: string;
    enteredBy: SimpleEntity;
    enteredOn: Date;
    pointValue: number;
}

export interface ManualChallengeBonus extends ManualBonus {
    challengeId: string;
}

export interface ManualTeamBonus extends ManualBonus {
    teamId: string;
}

export interface GameScore {
    game: GameScoreGameInfo;
    teams: GameScoreTeam[];
}

export interface GameScoreGameInfo {
    id: string;
    name: string;
    isTeamGame: boolean;
    specs: ChallengeSpecScoringConfig[];
}

export interface GameScoreTeam {
    challenges: TeamScoreChallenge[];
    liveSessionEnds: Date | null;
    manualBonuses: ManualTeamBonus[];
    isAdvancedToNextRound: boolean;
    overallScore: Score;
    players: PlayerWithSponsor[];
    rank: number;
    team: SimpleEntity;
    totalTimeMs: number;
}

export interface TeamScoreChallenge {
    id: string;
    name: string;
    specId: string;
    result: ChallengeResult;
    score: Score;
    solveType: ChallengeResult;
    bonuses: AutoChallengeBonus[];
    manualBonuses: ManualChallengeBonus[];
}

export interface TeamScoreQueryResponse {
    gameInfo: GameScoreGameInfo;
    score: TeamScore;
}


export interface TeamScore {
    team: SimpleEntity,
    players: PlayerWithSponsor[];
    challenges: TeamScoreChallenge[];
    manualBonuses: ManualTeamBonus[];
    isAdvancedToNextRound: boolean;
    overallScore: Score;
    cumulativeTimeMs: number;
}

export interface AutoChallengeBonus {
    description: string;
    pointValue: number;
    solveRank: number;
}

export interface GameAutoBonusConfig {
    allChallengesBonuses: GameLevelAutoChallengeBonus[];
    specificChallengesBonuses: ChallengeLevelAutoChallengeBonus;
}

export interface GameLevelAutoChallengeBonus extends AutoChallengeBonus {
}

export interface ChallengeLevelAutoChallengeBonus extends AutoChallengeBonus {
    supportKey: string;
}

export interface UpdateGameAutoChallengeBonusConfig {
    allChallengesBonuses: AutoChallengeBonus[];
    specificChallengesBonuses: ChallengeLevelAutoChallengeBonus[];
}

export interface ScoreboardData {
    game: ScoreboardDataGame;
    teams: ScoreboardDataTeam[];
}

export interface ScoreboardDataGame {
    id: string;
    name: string;
    isLiveUntil?: DateTime,
    isTeamGame: boolean;
    specCount: number;
}

export interface ScoreboardDataTeam {
    id: string;
    isAdvancedToNextRound: boolean;
    players: PlayerWithSponsor[];
    score: DenormalizedTeamScore;
    sessionEnds?: DateTime;
    userCanAccessScoreDetail: boolean;
    userIsOnTeam: boolean;
}

export interface DenormalizedTeamScore {
    gameId: string;
    teamId: string;
    teamName: string;
    scoreOverall: number;
    scoreAdvanced?: number;
    scoreAutoBonus: number;
    scoreManualBonus: number;
    scoreChallenge: number;
    solveCountNone: number;
    solveCountPartial: number;
    solveCountComplete: number;
    cumulativeTimeMs: number;
    rank: number;
}
