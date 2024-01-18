import { DateTime } from "luxon";
import { DataItem } from "vis-timeline";

export type EventHorizonEventType = "challengeDeployed" |
    "gamespaceStarted" |
    "gamespaceStopped" |
    "solveComplete" |
    "submissionRejected" |
    "submissionScored"

export interface EventHorizonGenericEvent {
    id: string;
    challengeId: string;
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

export interface EventHorizonTeamChallenge {
    id: string;
    specId: string;
}

export interface EventHorizonChallengeSpec {
    id: string;
    name: string;
    maxAttempts: number;
    maxPossibleScore: number;
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
        challengeSpecs: EventHorizonChallengeSpec[]
    };
    team: {
        id: string;
        name: string;
        session: {
            start: DateTime;
            end: DateTime;
        },
        challenges: EventHorizonTeamChallenge[],
        events: EventHorizonEvent[]
    };
    viewOptions: EventHorizonViewOptions
}

export interface EventHorizonDataItem extends DataItem {
    eventData: EventHorizonGenericEvent | null;
}
