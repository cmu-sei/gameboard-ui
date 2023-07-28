import { GameCardContext } from "@/api/game-models";
import { PagedArray } from "@/api/models";
import { SpecSummary } from "@/api/spec-models";

export interface SearchPracticeChallengesResult {
    results: PagedArray<SpecSummary>;
}

export interface SearchGamesResult {
    results: PagedArray<GameCardContext>;
}
