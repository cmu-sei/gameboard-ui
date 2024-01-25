import { EventHorizonDataItem, EventHorizonGenericEvent, EventHorizonEventType, EventHorizonSolveCompleteEvent, EventHorizonSubmissionScoredEvent, EventHorizonChallengeSpec, EventHorizonViewOptions, TeamEventHorizonViewModel, EventHorizonGamespaceOnOffEvent } from '@/api/event-horizon.models';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { MarkdownHelpersService } from './markdown-helpers.service';
import { DataGroup } from 'vis-timeline';
import { NowService } from './now.service';

@Injectable({ providedIn: 'root' })
export class EventHorizonRenderingService {
  constructor(
    private markdownHelpers: MarkdownHelpersService,
    private nowService: NowService) { }

  public getViewOptions(eventHorizonVm: TeamEventHorizonViewModel): EventHorizonViewOptions {
    const sessionEnd = eventHorizonVm.team.session.end || DateTime.now();
    const durationMs = sessionEnd.diff(eventHorizonVm.team.session.start);

    return {
      align: "left",
      end: sessionEnd.toJSDate(),
      groupTemplate: (groupData: any, element: any) => this.toGroupTemplate(groupData),
      min: eventHorizonVm.team.session.start.toJSDate(),
      max: sessionEnd.toJSDate(),
      selectable: true,
      stackSubgroups: false,
      start: eventHorizonVm.team.session.start.toJSDate(),
      zoomMax: durationMs.shiftTo("milliseconds").milliseconds
    };
  }

  public toDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    switch (timelineEvent.type) {
      case "challengeStarted":
        return this.toGenericDataItem(timelineEvent, challengeSpec, "Started", "eh-event-type-challenge-started");
      case "gamespaceOnOff":
        return this.toGamespaceOnOffDataItem(timelineEvent, challengeSpec);
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
      case "challengeStarted":
        return "Challenge Started";
      case "gamespaceOnOff":
        return "Gamespace On";
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
    if (!groupData)
      return "";

    return `<div class="eh-group">${groupData.content}</div>`;
  }

  public toModalContent(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): string {
    if (!timelineEvent)
      return "";

    switch (timelineEvent.type) {
      case "solveComplete":
        return this.toSolveCompleteModalContent(timelineEvent as EventHorizonSolveCompleteEvent, challengeSpec);
      case "submissionScored":
        return this.toSubmissionScoredModalContent(timelineEvent as EventHorizonSubmissionScoredEvent, challengeSpec);
    }

    return "";
  }

  private toSubmissionScoredModalContent(timelineEvent: EventHorizonSubmissionScoredEvent, challengeSpec: EventHorizonChallengeSpec) {
    return `**Attempt:** ${timelineEvent.eventData.attemptNumber}/${challengeSpec.maxAttempts}

**Points after this attempt:** ${timelineEvent.eventData.score}/${challengeSpec.maxPossibleScore}

**Submitted Answers** \n\n ${this.markdownHelpers.arrayToOrderedList(timelineEvent.eventData.answers, "(no response)")}
`.trim();
  }

  private toSolveCompleteModalContent(timelineEvent: EventHorizonSolveCompleteEvent, challengeSpec: EventHorizonChallengeSpec) {
    return `**Attempts Used:** ${timelineEvent.eventData.attemptsUsed}/${challengeSpec.maxAttempts}

**Final Score:** ${timelineEvent.eventData.finalScore}/${challengeSpec.maxPossibleScore}
    `.trim();
  }

  private toGenericDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec, eventName: string, className: string, isClickable = false): EventHorizonDataItem {
    return {
      id: timelineEvent.id,
      group: challengeSpec.id,
      // subgroup: timelineEvent.type,
      start: timelineEvent.timestamp.toJSDate(),
      content: `${eventName} :: ${timelineEvent.timestamp.toLocaleString(DateTime.TIME_WITH_SECONDS)}`,
      className: `eh-event ${isClickable ? "eh-event-clickable" : ""} ${className}`,
      isClickable,
      eventData: null
    };
  }

  private toGamespaceOnOffDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonGamespaceOnOffEvent;
    const baseItem = this.toGenericDataItem(timelineEvent, challengeSpec, "Gamespace On", "eh-event-type-gamespace-on-off", false);

    baseItem.end = typedEvent.eventData?.offAt?.toJSDate() || this.nowService.now();
    baseItem.eventData = typedEvent;
    baseItem.type = "background";

    return baseItem;
  }

  private toSolveCompleteDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSolveCompleteEvent;
    const baseItem = this.toGenericDataItem(timelineEvent, challengeSpec, `Challenge Completed (${typedEvent.eventData.finalScore} points)`, "eh-event-type-challenge-complete", true);

    baseItem.eventData = typedEvent;

    return baseItem;
  }

  private toSubmissionScoredDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSubmissionScoredEvent;
    const baseItem = this.toGenericDataItem(timelineEvent, challengeSpec, `Submission ${typedEvent.eventData.attemptNumber}/${challengeSpec.maxAttempts} (${typedEvent.eventData.score} points)`, "eh-event-type-submission-scored", true);

    baseItem.eventData = typedEvent;
    return baseItem;
  }
}
