import { SimpleEntity } from "../../api/models";

export interface GameScoringConfig {
    game: SimpleEntity;
    challengeSpecScoringConfigs: ChallengeSpecScoringConfig[];    
}

export interface ChallengeSpecScoringConfig {
    challengeSpec: SimpleEntity;
    completionScore: number;
    possibleBonuses: GameScoringConfigChallengeBonus[];
    maxPossibleScore: number;
}

export interface GameScoringConfigChallengeBonus {
    id: string;
    description: string;
    pointValue: string;
}
