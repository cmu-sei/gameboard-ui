import { PlayerWithAvatar, SimpleEntity } from "./models";

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
}

export interface GameScoreTeam {
    team: SimpleEntity,
    players: PlayerWithAvatar[];
    rank: number;
    challenges: TeamChallengeScoreSummary;
}

export interface TeamChallengeScoreSummary {
    challenge: SimpleEntity;
    spec: SimpleEntity;
    team: SimpleEntity;
    score: Score;
    manualBonuses: ManualChallengeBonusViewModel[];
}

export interface TeamGameScoreSummary {
    game: SimpleEntity,
    team: SimpleEntity,
    score: Score,
    challengeScoreSummaries: TeamChallengeScoreSummary[];
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
