import { SimpleEntity } from "./models";

export interface ManualChallengeBonusViewModel {
    id: string;
    description: string;
    enteredBy: SimpleEntity;
    enteredOn: Date;
    challengeId: string;
}

export interface TeamChallengeScoreSummary {
    team: SimpleEntity;
    baseScore: number;
    bonusScore: number;
    totalScore: number;
    manualBonuses: ManualChallengeBonusViewModel[];
}
