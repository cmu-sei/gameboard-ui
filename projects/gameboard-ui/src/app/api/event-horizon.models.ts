import { DateTime } from "luxon";

export enum EventHorizonEventType {
    ChallengeDeployed = "challengeDeployed",
    GamespaceStarted = "gamespaceStarted",
    GamespaceStopped = "gamespaceStopped",
    SolveComplete = "solveComplete",
    SubmissionScored = "submissionScored",
    SubmissionRejected = "submissionRejected",
}

export interface EventHorizonEvent {
    id: string;
    type: EventHorizonEventType;
    timestamp: DateTime;
}

export interface EventHorizonSubmissionScoredEvent extends EventHorizonEvent {
    submissionScoredEventData: {
        score: number;
        attemptNumber: number;
        answers: string[];
    }
}

export interface EventHorizonChallenge {
    id: string;
    specId: string;
    name: string;
    maxAttempts: number;
    events: (EventHorizonEvent | EventHorizonSubmissionScoredEvent | EventHorizonSolveCompleteEvent)[]
}

export interface EventHorizonSolveCompleteEvent extends EventHorizonEvent {
    solveCompleteEventData: {
        attemptsUsed: number;
        finalScore: number;
    };
}

export interface EventHorizonGroup {
    id: string;
    name: string;
}

export interface EventHorizonViewOptions {
    align: "auto" | "center" | "left" | "right",
    clickToUse: boolean,
    end: Date,
    min: Date;
    max: Date;
    selectable: false;
    start: Date,
    zoomMax: number;
}

export interface TeamEventHorizonViewModel {
    game: {
        id: string;
        name: string;
        challengeSpecs: {
            id: string;
            name: string;
            maxPossibleScore: number
        }[]
    };
    team: {
        id: string;
        name: string;
        session: {
            start: DateTime;
            end: DateTime;
        },
        challenges: EventHorizonChallenge[];
    };
    viewOptions: EventHorizonViewOptions
}
