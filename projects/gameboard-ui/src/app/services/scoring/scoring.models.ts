import { SimpleEntity } from "../../api/models";

export interface GameScoringConfig {
    game: SimpleEntity;
    challengeSpecScoringConfigs: GameScoringConfigChallengeSpec[];    
}

export interface GameScoringConfigChallengeSpec {
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
