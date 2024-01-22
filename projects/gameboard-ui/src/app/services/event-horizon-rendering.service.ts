import { EventHorizonDataItem, EventHorizonGenericEvent, EventHorizonEventType, EventHorizonSolveCompleteEvent, EventHorizonSubmissionScoredEvent, EventHorizonChallengeSpec, EventHorizonViewOptions, TeamEventHorizonViewModel } from '@/api/event-horizon.models';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { MarkdownHelpersService } from './markdown-helpers.service';
import { DataGroup } from 'vis-timeline';

@Injectable({ providedIn: 'root' })
export class EventHorizonRenderingService {
  constructor(private markdownHelpers: MarkdownHelpersService) { }

  public getViewOptions(eventHorizonVm: TeamEventHorizonViewModel): EventHorizonViewOptions {
    return {
      align: "left",
      end: eventHorizonVm.team.session.end.toJSDate(),
      groupTemplate: (groupData: any, element: any) => this.toGroupTemplate(groupData),
      min: eventHorizonVm.team.session.start.toJSDate(),
      max: eventHorizonVm.team.session.end.toJSDate(),
      selectable: true,
      start: eventHorizonVm.team.session.start.toJSDate(),
      zoomMax: 1000 * 60 * 60 * 4
    };
  }

  public toDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    switch (timelineEvent.type) {
      case "challengeDeployed":
        return this.toGenericDataItem(timelineEvent, challengeSpec, "Deployed", "eh-event-type-challenge-deployed");
      case "gamespaceStarted":
        return this.toGenericDataItem(timelineEvent, challengeSpec, "Gamespace Started", "eh-event-type-gamespace");
      case "gamespaceStopped":
        return this.toGenericDataItem(timelineEvent, challengeSpec, "Gamespace Stopped", "eh-event-type-gamespace");
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

  public toGroupTemplate(groupData: DataGroup): string {
    return `<div class="eh-group">${groupData.content}</div>`;
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

**Points after this attempt:** ${timelineEvent.submissionScoredEventData.score}/${challengeSpec.maxPossibleScore}

**Submitted Answers:** \n\n ${this.markdownHelpers.arrayToOrderedList(timelineEvent.submissionScoredEventData.answers)}
`.trim();
  }

  private toSolveCompleteModalContent(timelineEvent: EventHorizonSolveCompleteEvent, challengeSpec: EventHorizonChallengeSpec) {
    return `**Attempts Used:** ${timelineEvent.solveCompleteEventData.attemptsUsed}/${challengeSpec.maxAttempts}

**Final Score:** ${timelineEvent.solveCompleteEventData.finalScore}/${challengeSpec.maxPossibleScore}
    `.trim();
  }

  private toGenericDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec, eventName: string, className: string, isClickable = false): EventHorizonDataItem {
    return {
      id: timelineEvent.id,
      group: challengeSpec.id,
      start: timelineEvent.timestamp.toJSDate(),
      content: `${eventName} :: ${timelineEvent.timestamp.toLocaleString(DateTime.TIME_WITH_SECONDS)}`,
      className: `eh-event ${isClickable ? "eh-event-clickable" : ""} ${className}`,
      isClickable,
      eventData: null
    };
  }

  private toSolveCompleteDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSolveCompleteEvent;
    const baseItem = this.toGenericDataItem(timelineEvent, challengeSpec, "Challenge Completed", "eh-event-type-challenge-complete", true);

    baseItem.eventData = typedEvent;
    baseItem.isClickable = true;

    return baseItem;
  }

  private toSubmissionScoredDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSubmissionScoredEvent;
    const baseItem = this.toGenericDataItem(timelineEvent, challengeSpec, "Submission", "eh-event-type-submission-scored", true);

    baseItem.eventData = typedEvent;
    baseItem.isClickable = true;

    return baseItem;
  }
}
