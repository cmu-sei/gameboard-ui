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

export interface ManualChallengeBonusViewModel {
    id: string;
    description: string;
    enteredBy: SimpleEntity;
    enteredOn: Date;
    challengeId: string;
    pointValue: number;
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
    manualBonuses: ManualChallengeBonusViewModel[];
}

export interface TeamGameScoreQueryResponse {
    gameInfo: GameScoreGameInfo;
    score: TeamGameScore
}

export interface TeamGameScore {
    game: SimpleEntity,
    team: SimpleEntity,
    overallScore: Score,
    challenges: TeamScoreChallenge[];
}

export interface AutoChallengeBonus {
    description?: string;
    pointValue: number;
    solveRank: number;
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
