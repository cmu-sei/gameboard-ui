import { ChallengeResult } from "@/api/board-models";
import { SimpleEntity, PlayerWithSponsor } from "@/api/models";

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
}

export interface GameScoringConfigChallengeBonus {
    id: string;
    description: string;
    pointValue: string;
}

export interface Score {
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
    manualBonuses: ManualChallengeBonus[];
}

export interface TeamScoreQueryResponse {
    gameInfo: GameScoreGameInfo;
    score: TeamScore
}

export interface TeamScore {
    game: SimpleEntity,
    team: SimpleEntity,
    players: PlayerWithSponsor[];
    challenges: TeamScoreChallenge[];
    manualBonuses: ManualTeamBonus[];
    overallScore: Score,
}

export interface AutoChallengeBonus {
    description?: string;
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
