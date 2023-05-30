import { SimpleEntity } from "./models";

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

export interface TeamChallengeScoreSummary {
    challenge: SimpleEntity;
    spec: SimpleEntity;
    team: SimpleEntity;
    scoreFromChallenge: number;
    scoreFromManualBonuses: number;
    totalScore: number;
    manualBonuses: ManualChallengeBonusViewModel[];
}

export interface TeamGameScoreSummary {
    game: SimpleEntity,
    team: SimpleEntity,
    totalScore: number;
    challengesScore: number;
    manualBonusesScore: number;
    challengeScoreSummaries: TeamChallengeScoreSummary[];
}

export interface AutoChallengeBonus {
    description?: string;
    pointValue: number;
    solveRank: number;
}

export interface GameLevelAutoChallengeBonus extends AutoChallengeBonus {
    gameId: string;
}

export interface ChallengeLevelAutoChallengeBonus extends AutoChallengeBonus {
    challengeSpecSupportKey: string;
}

export interface UpdateGameAutoChallengeBonusConfig {
    allChallengeBonuses: AutoChallengeBonus[];
    specificChallengeBonuses: ChallengeLevelAutoChallengeBonus[];
}
