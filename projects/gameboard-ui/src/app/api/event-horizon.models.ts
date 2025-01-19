import { DateTime } from "luxon";
import { DataItem, TimelineOptions } from "vis-timeline";

export type EventHorizonEventType = "challengeStarted" |
    "gamespaceOnOff" |
    "solveComplete" |
    "submissionRejected" |
    "submissionScored" |
    "ticketOpenClose"

export interface EventHorizonGenericEvent {
    id: string;
    challengeId: string;
    type: EventHorizonEventType;
    timestamp: DateTime;
}

export interface EventHorizonGamespaceOnOffEvent extends EventHorizonGenericEvent {
    eventData: {
        offAt?: DateTime;
    };
}

export interface EventHorizonSubmissionScoredEvent extends EventHorizonGenericEvent {
    eventData: {
        score: number;
        attemptNumber: number;
        answers: string[];
    }
}

export interface EventHorizonSolveCompleteEvent extends EventHorizonGenericEvent {
    eventData: {
        attemptsUsed: number;
        finalScore: number;
    };
}

export interface EventHorizonTicketOpenCloseEvent extends EventHorizonGenericEvent {
    eventData: {
        closedAt?: DateTime
    }
}

export type EventHorizonEvent = EventHorizonGenericEvent |
    EventHorizonGamespaceOnOffEvent |
    EventHorizonSubmissionScoredEvent |
    EventHorizonSolveCompleteEvent |
    EventHorizonTicketOpenCloseEvent;

export interface EventHorizonChallenge {
    id: string;
    specId: string;
    name: string;
}

export interface EventHorizonTeamChallenge {
    id: string;
    score?: number;
    specId: string;
}

export interface EventHorizonChallengeSpec {
    id: string;
    name: string;
    maxAttempts: number;
    maxPossibleScore: number;
}

export interface EventHorizonGroup {
    id: string;
    name: string;
}

export interface EventHorizonViewOptions extends TimelineOptions { }

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
            end: DateTime | null;
        },
        challenges: EventHorizonTeamChallenge[],
        events: EventHorizonEvent[]
    };
}

export interface EventHorizonDataItem extends DataItem {
    eventData: EventHorizonEvent | null;
    isClickable: boolean;
}
