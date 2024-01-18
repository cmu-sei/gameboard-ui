import { DateTime } from "luxon";
import { DataItem } from "vis-timeline";

export enum EventHorizonEventType {
    ChallengeDeployed = "challengeDeployed",
    GamespaceStarted = "gamespaceStarted",
    GamespaceStopped = "gamespaceStopped",
    SolveComplete = "solveComplete",
    SubmissionScored = "submissionScored",
    SubmissionRejected = "submissionRejected",
}

export interface EventHorizonGenericEvent {
    id: string;
    type: EventHorizonEventType;
    timestamp: DateTime;
}

export interface EventHorizonSubmissionScoredEvent extends EventHorizonGenericEvent {
    submissionScoredEventData: {
        score: number;
        attemptNumber: number;
        answers: string[];
    }
}

export type EventHorizonEvent = EventHorizonGenericEvent | EventHorizonSubmissionScoredEvent | EventHorizonSolveCompleteEvent;

export interface EventHorizonChallenge {
    id: string;
    specId: string;
    name: string;
}

export interface EventHorizonSolveCompleteEvent extends EventHorizonGenericEvent {
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
    clickToUse?: boolean,
    end: Date,
    min: Date;
    max: Date;
    selectable: boolean;
    start: Date;
    zoomMax: number;
}

export interface TeamEventHorizonViewModel {
    game: {
        id: string;
        name: string;
        challengeSpecs: {
            id: string;
            name: string;
            maxAttempts: number;
            maxPossibleScore: number;
        }[]
    };
    team: {
        id: string;
        name: string;
        session: {
            start: DateTime;
            end: DateTime;
        },
        events: EventHorizonEvent[]
    };
    viewOptions: EventHorizonViewOptions
}

export interface EventHorizonDataItem extends DataItem {
    eventData: EventHorizonGenericEvent | null;
}
