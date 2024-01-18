import { EventHorizonChallenge, EventHorizonDataItem, EventHorizonGenericEvent, EventHorizonEventType, EventHorizonSolveCompleteEvent, EventHorizonSubmissionScoredEvent } from '@/api/event-horizon.models';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { MarkdownService } from 'ngx-markdown';
import { MarkdownHelpersService } from './markdown-helpers.service';

@Injectable({ providedIn: 'root' })
export class EventHorizonRenderingService {
  constructor(
    private markdownHelpers: MarkdownHelpersService,
    private markdownService: MarkdownService) {

  }

  public toDataItem(timelineEvent: EventHorizonGenericEvent, challenge: EventHorizonChallenge): EventHorizonDataItem {
    switch (timelineEvent.type) {
      case EventHorizonEventType.ChallengeDeployed:
        return this.toGenericDataItem(timelineEvent, challenge, "Deployed", "event-type-challenge-deployed");
      case EventHorizonEventType.GamespaceStarted:
        return this.toGenericDataItem(timelineEvent, challenge, "Gamespace Started", "event-type-gamespace");
      case EventHorizonEventType.GamespaceStopped:
        return this.toGenericDataItem(timelineEvent, challenge, "Gamespace Stopped", "event-type-gamespace");
      case EventHorizonEventType.SolveComplete:
        return this.toSolveCompleteDataItem(timelineEvent, challenge);
      case EventHorizonEventType.SubmissionScored: {
        return this.toSubmissionScoredDataItem(timelineEvent, challenge);
      }
    }
    throw new Error("Timeline event type not templated.");
  }

  public toModalContent(timelineEvent: EventHorizonGenericEvent, challenge: EventHorizonChallenge): string {
    switch (timelineEvent.type) {
      case EventHorizonEventType.SolveComplete:
        return this.toSolveCompleteModalContent(timelineEvent as EventHorizonSolveCompleteEvent, challenge);
    }

    return "";
  }

  public toSolveCompleteModalContent(timelineEvent: EventHorizonSolveCompleteEvent, challenge: EventHorizonChallenge) {
    return `
      
    `.trim();
  }

  private toGenericDataItem(timelineEvent: EventHorizonGenericEvent, challenge: EventHorizonChallenge, eventName: string, className: string): EventHorizonDataItem {
    return {
      id: timelineEvent.id,
      group: challenge.specId,
      start: timelineEvent.timestamp.toJSDate(),
      content: `${eventName} :: ${timelineEvent.timestamp.toLocaleString(DateTime.TIME_WITH_SECONDS)}`,
      className: className,
      eventData: null
    };
  }

  private toSolveCompleteDataItem(timelineEvent: EventHorizonGenericEvent, challenge: EventHorizonChallenge): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSolveCompleteEvent;

    return {
      id: typedEvent.id,
      start: timelineEvent.timestamp.toJSDate(),
      content: this.markdownService.parse(`
        # Challenge completed :: ${typedEvent.timestamp.toLocaleString(DateTime.TIME_WITH_SECONDS)}

        **Submissions:** ${typedEvent.solveCompleteEventData.attemptsUsed}/${challenge.maxAttempts}
        **Total points:** ${typedEvent.solveCompleteEventData.finalScore}
      `).trim(),
      className: "event-type-challenge-complete",
      group: challenge.specId,
      eventData: typedEvent
    };
  }

  private toSubmissionScoredDataItem(timelineEvent: EventHorizonGenericEvent, challenge: EventHorizonChallenge): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSubmissionScoredEvent;
    return {
      id: typedEvent.id,
      start: typedEvent.timestamp.toJSDate(),
      content: this.markdownService.parse(`
        # Submission :: ${typedEvent.timestamp.toLocaleString(DateTime.TIME_WITH_SECONDS)} (${typedEvent.submissionScoredEventData.attemptNumber}/${challenge.maxAttempts})

        ## Points Awarded: ${typedEvent.submissionScoredEventData.score}

        ${this.markdownHelpers.arrayToBulletList(typedEvent.submissionScoredEventData.answers)}
      `).trim(),
      className: "event-type-submission-scored",
      group: challenge.specId,
      eventData: typedEvent
    };
  }
}
