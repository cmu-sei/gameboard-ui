import { EventHorizonChallenge, EventHorizonDataItem, EventHorizonGenericEvent, EventHorizonEventType, EventHorizonSolveCompleteEvent, EventHorizonSubmissionScoredEvent, EventHorizonChallengeSpec } from '@/api/event-horizon.models';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { MarkdownService } from 'ngx-markdown';
import { MarkdownHelpersService } from './markdown-helpers.service';

@Injectable({ providedIn: 'root' })
export class EventHorizonRenderingService {
  constructor(
    private markdownHelpers: MarkdownHelpersService,
    private markdownService: MarkdownService) { }

  public toDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    switch (timelineEvent.type) {
      case "challengeDeployed":
        return this.toGenericDataItem(timelineEvent, challengeSpec, "Deployed", "event-type-challenge-deployed");
      case "gamespaceStarted":
        return this.toGenericDataItem(timelineEvent, challengeSpec, "Gamespace Started", "event-type-gamespace");
      case "gamespaceStopped":
        return this.toGenericDataItem(timelineEvent, challengeSpec, "Gamespace Stopped", "event-type-gamespace");
      case "solveComplete":
        return this.toSolveCompleteDataItem(timelineEvent, challengeSpec);
      case "submissionScored": {
        return this.toSubmissionScoredDataItem(timelineEvent, challengeSpec);
      }
    }
    throw new Error("Timeline event type not templated.");
  }

  public toFriendlyName(eventType: EventHorizonEventType): string {
    switch (eventType) {
      case "challengeDeployed":
        return "Challenge Deployed";
      case "gamespaceStarted":
        return "Gamespace Started";
      case "gamespaceStopped":
        return "Gamespace Stopped";
      case "solveComplete":
        return "Challenge Completed";
      case "submissionRejected":
        return "Submission Rejected (Session Expired)";
      case "submissionScored":
        return "Submission";
      default:
        throw new Error(`Couldn't find a friendly name for event type "${eventType}".`);
    }
  }

  public toModalContent(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): string {
    switch (timelineEvent.type) {
      case "solveComplete":
        return this.toSolveCompleteModalContent(timelineEvent as EventHorizonSolveCompleteEvent, challengeSpec);
      case "submissionScored":
        return this.toSubmissionScoredModalContent(timelineEvent as EventHorizonSubmissionScoredEvent, challengeSpec);
    }

    return "";
  }

  private toSubmissionScoredModalContent(timelineEvent: EventHorizonSubmissionScoredEvent, challengeSpec: EventHorizonChallengeSpec) {
    return `**Attempt:** ${timelineEvent.submissionScoredEventData.attemptNumber}/${challengeSpec.maxAttempts}

**Points for this attempt:** ${timelineEvent.submissionScoredEventData.score}/${challengeSpec.maxPossibleScore}

**Submitted Answers:** ${this.markdownHelpers.arrayToBulletList(timelineEvent.submissionScoredEventData.answers)}
`.trim();
  }

  private toSolveCompleteModalContent(timelineEvent: EventHorizonSolveCompleteEvent, challengeSpec: EventHorizonChallengeSpec) {
    return `**Attempts Used:** ${timelineEvent.solveCompleteEventData.attemptsUsed}/${challengeSpec.maxAttempts}

**Final Score:** ${timelineEvent.solveCompleteEventData.finalScore}/${challengeSpec.maxPossibleScore}
    `.trim();
  }

  private toGenericDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec, eventName: string, className: string): EventHorizonDataItem {
    return {
      id: timelineEvent.id,
      group: challengeSpec.id,
      start: timelineEvent.timestamp.toJSDate(),
      content: `${eventName} :: ${timelineEvent.timestamp.toLocaleString(DateTime.TIME_WITH_SECONDS)}`,
      className: className,
      eventData: null
    };
  }

  private toSolveCompleteDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSolveCompleteEvent;

    return {
      id: typedEvent.id,
      start: timelineEvent.timestamp.toJSDate(),
      content: this.markdownService.parse(`Challenge Completed :: ${typedEvent.timestamp.toLocaleString(DateTime.TIME_WITH_SECONDS)}`),
      className: "event-type-challenge-complete",
      group: challengeSpec.id,
      eventData: typedEvent
    };
  }

  private toSubmissionScoredDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSubmissionScoredEvent;
    return {
      id: typedEvent.id,
      start: typedEvent.timestamp.toJSDate(),
      content: this.markdownService.parse(`Submission :: ${typedEvent.timestamp.toLocaleString(DateTime.TIME_WITH_SECONDS)} (${typedEvent.submissionScoredEventData.attemptNumber}/${challengeSpec.maxAttempts})`),
      className: "event-type-submission-scored",
      group: challengeSpec.id,
      eventData: typedEvent
    };
  }
}
