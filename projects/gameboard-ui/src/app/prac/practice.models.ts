import { GameCardContext } from "@/api/game-models";
import { PagedArray, Search, TimestampRange } from "@/api/models";
import { DateTime } from "luxon";

export interface SearchPracticeChallengesRequest {
    filter: Search;
    userProgress?: SearchPracticeChallengesRequestUserProgress;
}

export type SearchPracticeChallengesRequestUserProgress = "notAttempted" | "attempted" | "completed";

export interface SearchPracticeChallengesResult {
    results: PagedArray<PracticeChallengeView>;
}

export interface SearchGamesResult {
    results: PagedArray<GameCardContext>;
}

export interface PracticeModeSettings {
    attemptLimit?: number;
    certificateTemplateId?: string;
    defaultPracticeSessionLengthMinutes: number;
    introTextMarkdown: string;
    maxConcurrentPracticeSessions: number | null;
    maxPracticeSessionLengthMinutes: number | null;
    suggestedSearches: string[];
}

export interface PracticeSession {
    gameId: string;
    playerId: string;
    session: TimestampRange;
    teamId: string;
    userId: string;
}

export interface PracticeChallengeView {
    id: string;
    name: string;
    description: string;
    text: string;
    averageDeploySeconds: number;
    isHidden: boolean;
    feedbackTemplateId: string;
    solutionGuideUrl: string;
    scoreMaxPossible: number;
    tags: string[];
    game: {
        id: string;
        name: string;
        logo: string;
        isHidden: string;
    },
    userBestAttempt?: UserPracticeHistoryChallenge;
}

export interface UserPracticeHistoryChallenge {
    challengeId: string;
    challengeSpecId: string;
    challengeName: string;
    attemptCount: number;
    bestAttemptDate?: DateTime;
    bestAttemptScore?: number;
    isComplete: boolean;
}

export interface UserPracticeSummary {
    countAttempted: number;
    countAvailable: number;
    countCompleted: number;
    pointsAvailable: number;
    pointsScored: number;
    tagsPlayed: UserPracticeSummaryTagEngagement[];
    tagsUnplayed: string[];
}

export interface UserPracticeSummaryTagEngagement {
    tag: string;
    countAttempted: number;
    countAvailable: number;
    countCompleted: number;
    pointsAvailable: number;
    pointsScored: number;
}
