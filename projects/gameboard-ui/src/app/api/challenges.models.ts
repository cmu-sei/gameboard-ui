import { ApiTimeWindow, LocalTimeWindow } from "@/core/models/api-time-window";
import { PlayerMode } from "./player-models";
import { VmState } from "./board-models";
import { SimpleEntity } from "./models";

export interface ChallengeSolutionGuide {
    challengeSpecId: string;
    showInCompetitiveMode: boolean;
    url: string;
}

export interface ActiveChallenge {
    id: string;
    spec: {
        id: string;
        name: string;
        tag: string;
        averageDeploySeconds: number;
    };
    game: SimpleEntity;
    player: SimpleEntity;
    user: SimpleEntity;
    challengeDeployment: {
        challengeId: string,
        isDeployed: boolean;
        markdown: string;
        vms: VmState[]
    };
    teamId: string;
    playerMode: PlayerMode;
    scoreAndAttemptsState: {
        score: number;
        maxPossibleScore: number;
        attempts: number;
        maxAttempts?: number;
    }
}

export interface ApiActiveChallenge extends ActiveChallenge {
    session: ApiTimeWindow;
}

export interface LocalActiveChallenge extends ActiveChallenge {
    session: LocalTimeWindow;
}

export interface ChallengeSubmissionAnswers {
    questionSetIndex: number;
    answers: string[];
}

export interface ChallengeSubmissionViewModel {
    sectionIndex: number;
    answers: string[];
    submittedOn: Date;
}

export interface GetChallengeSubmissionsResponse {
    challengeId: string;
    teamId: string;
    pendingAnswers: ChallengeSubmissionAnswers | null;
    submittedAnswers: ChallengeSubmissionViewModel[];
}

export interface UserApiActiveChallenges {
    user: SimpleEntity;
    competition: ApiActiveChallenge[];
    practice: ApiActiveChallenge[];
}

export interface UserActiveChallenges {
    user: SimpleEntity;
    competition: LocalActiveChallenge[];
    practice: LocalActiveChallenge[];
}
