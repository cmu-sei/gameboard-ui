import { GameCardContext } from "@/api/game-models";
import { PagedArray, SimpleEntity, TimestampRange } from "@/api/models";
import { SpecSummary } from "@/api/spec-models";

export interface SearchPracticeChallengesResult {
    results: PagedArray<SpecSummary>;
}

export interface SearchGamesResult {
    results: PagedArray<GameCardContext>;
}

export interface PracticeModeSettings {
    attemptLimit?: number;
    certificateHtmlTemplate: string;
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
