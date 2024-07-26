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
      stack: true,
      start: eventHorizonVm.team.session.start.toJSDate(),
      tooltip: {
        followMouse: true,
        overflowMethod: "flip"
      },
      zoomMax: durationMs.shiftTo("milliseconds").milliseconds
    };
  }

  public toDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    switch (timelineEvent.type) {
      case "challengeStarted":
        return this.toGenericDataItem(timelineEvent, challengeSpec, "Started", "eh-event-type-challenge-started", true);
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

  public toModalHtmlContent(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): string {
    if (!timelineEvent)
      return "";

    const header = this.getTooltipHeader(timelineEvent);
    let detail = "";

    switch (timelineEvent.type) {
      case "challengeStarted":
        detail = this.toChallengeStartedModalContent(timelineEvent, challengeSpec);
        break;
      case "solveComplete":
        detail = this.toSolveCompleteModalContent(timelineEvent as EventHorizonSolveCompleteEvent, challengeSpec);
        break;
      case "submissionScored":
        detail = this.toSubmissionScoredModalContent(timelineEvent as EventHorizonSubmissionScoredEvent, challengeSpec);
        break;
    }

    if (detail) {
      return `${header}\n\n${detail}\n\n_Click to copy this event to your clipboard as markdown_`;
    }

    return "";
  }

  private getTooltipHeader(timelineEvent: EventHorizonGenericEvent) {
    return `#### ${this.toFriendlyName(timelineEvent.type)}\n##### ${timelineEvent.timestamp.toLocaleString(DateTime.DATETIME_MED)}`;
  }

  private toChallengeStartedModalContent(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec) {
    return `${challengeSpec.name} began.`;
  }

  private toSubmissionScoredModalContent(timelineEvent: EventHorizonSubmissionScoredEvent, challengeSpec: EventHorizonChallengeSpec) {
    let attemptSummary = `${timelineEvent.eventData.attemptNumber}`;
    if (challengeSpec.maxAttempts)
      attemptSummary = `${attemptSummary}/${challengeSpec.maxAttempts}`;

    return `
**Attempt:** ${attemptSummary}

**Points after this attempt:** ${timelineEvent.eventData.score}/${challengeSpec.maxPossibleScore}

**Submitted Answers** \n\n ${this.markdownHelpers.arrayToOrderedList(timelineEvent.eventData.answers, "(no response)")}
`.trim();
  }

  private toSolveCompleteModalContent(timelineEvent: EventHorizonSolveCompleteEvent, challengeSpec: EventHorizonChallengeSpec) {
    let attemptSummary = `${timelineEvent.eventData.attemptsUsed}`;
    if (challengeSpec.maxAttempts)
      attemptSummary = `${attemptSummary}/${challengeSpec.maxAttempts}`;

    return `**Attempts Used:** ${attemptSummary}

**Final Score:** ${timelineEvent.eventData.finalScore}/${challengeSpec.maxPossibleScore}
    `.trim();
  }

  private toGenericDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec, eventName: string, className: string, isClickable = false): EventHorizonDataItem {
    return {
      id: timelineEvent.id,
      group: challengeSpec.id,
      start: timelineEvent.timestamp.toJSDate(),
      content: eventName,
      className: `eh-event ${isClickable ? "eh-event-clickable" : ""} ${className}`,
      isClickable,
      title: this.markdownHelpers.toHtml(this.toModalHtmlContent(timelineEvent, challengeSpec)),
      eventData: null
    };
  }

  private toGamespaceOnOffDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonGamespaceOnOffEvent;
    const baseItem = this.toGenericDataItem(timelineEvent, challengeSpec, "Gamespace On", "eh-event-type-gamespace-on-off", false);

    baseItem.end = typedEvent.eventData?.offAt ? typedEvent.eventData.offAt.toJSDate() : this.nowService.now();
    baseItem.eventData = typedEvent;
    baseItem.type = "background";

    return baseItem;
  }

  private toSolveCompleteDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSolveCompleteEvent;
    const baseItem = this.toGenericDataItem(timelineEvent, challengeSpec, "Completed", "eh-event-type-challenge-complete", true);
    baseItem.eventData = typedEvent;

    return baseItem;
  }

  private toSubmissionScoredDataItem(timelineEvent: EventHorizonGenericEvent, challengeSpec: EventHorizonChallengeSpec): EventHorizonDataItem {
    const typedEvent = timelineEvent as unknown as EventHorizonSubmissionScoredEvent;
    const baseItem = this.toGenericDataItem(timelineEvent, challengeSpec, "Submission", "eh-event-type-submission-scored", true);
    baseItem.eventData = typedEvent;

    return baseItem;
  }
}
