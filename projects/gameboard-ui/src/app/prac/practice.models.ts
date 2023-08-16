import { GameCardContext } from "@/api/game-models";
import { PagedArray, SimpleEntity } from "@/api/models";
import { SpecSummary } from "@/api/spec-models";
import { Duration } from "luxon";

export interface SearchPracticeChallengesResult {
    results: PagedArray<SpecSummary>;
}

export interface SearchGamesResult {
    results: PagedArray<GameCardContext>;
}

export interface PracticeModeCertificate {
    challenge: {
        id: string;
        name: string;
        description: string;
        challengeSpecId: string;
    };
    date: Date;
    game: {
        id: string;
        name: string;
        season: string;
        track: string;
        division: string;
    }
    playerName: string;
    score: number;
    time: Duration;
}

export interface PracticeModeSettings {
    certificateHtmlTemplate: string;
    defaultPracticeSessionLengthMinutes: number;
    introTextMarkdown: string;
    maxConcurrentPracticeSessions: number | null;
    maxPracticeSessionLengthMinutes: number | null;
}
