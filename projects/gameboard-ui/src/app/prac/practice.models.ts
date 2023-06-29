import { PagedArray } from "@/api/models";
import { SpecSummary } from "@/api/spec-models";

export interface SearchPracticeChallengesResult {
    results: PagedArray<SpecSummary>;
}
