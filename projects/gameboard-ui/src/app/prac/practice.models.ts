import { GameCardContext } from "@/api/game-models";
import { PagedArray, SimpleEntity } from "@/api/models";
import { SpecSummary } from "@/api/spec-models";

export interface SearchPracticeChallengesResult {
    results: PagedArray<SpecSummary>;
}

export interface SearchGamesResult {
    results: PagedArray<GameCardContext>;
}

export interface PracticeModeSettings {
    certificateHtmlTemplate: string;
    defaultPracticeSessionLengthMinutes: number;
    introTextMarkdown: string;
    maxConcurrentPracticeSessions: number | null;
    maxPracticeSessionLengthMinutes: number | null;
}
