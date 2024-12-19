import { GameCardContext } from "@/api/game-models";
import { PagedArray, TimestampRange } from "@/api/models";

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
    solutionGuideUrl: string;
    tags: string[];
    game: {
        id: string;
        name: string;
        logo: string;
        isHidden: string;
    }
}
