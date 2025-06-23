import { EventHorizonDataItem, EventHorizonEventType, TeamEventHorizonViewModel } from '@/api/event-horizon.models';
import { EventHorizonService } from '@/api/event-horizon.service';
import { EventHorizonRenderingService } from '@/services/event-horizon-rendering.service';
import { LogService } from '@/services/log.service';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Timeline } from 'vis-timeline/esnext';

@Component({
    selector: 'app-team-event-horizon',
    templateUrl: './team-event-horizon.component.html',
    styleUrls: ['./team-event-horizon.component.scss'],
    standalone: false
})
export class TeamEventHorizonComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() teamId?: string;
  @ViewChild("timelineContainer") timelineContainer?: ElementRef;

  protected selectedEventTypes: EventHorizonEventType[] = [];
  protected allEventTypes: EventHorizonEventType[] = [];
  protected timelineViewModel: TeamEventHorizonViewModel | null = null;
  private timeline?: Timeline;

  constructor(
    private clipboardService: ClipboardService,
    private eventHorizonService: EventHorizonService,
    private eventHorizonRenderingService: EventHorizonRenderingService,
    private logService: LogService,
    private toastService: ToastService) { }

  ngOnInit() {
    // load available event types
    const eventTypes = this.eventHorizonService.getEventTypes().filter(t => t !== "submissionRejected");
    this.allEventTypes = [...eventTypes];
    this.selectedEventTypes = [...eventTypes];
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.teamId)
      throw new Error("Can't use the team event horizon component without a team Id.");

    // Create a Timeline
    // (apparently this just does the thing, which is weird, but whatever)
    this.timelineViewModel = await this.eventHorizonService.getTeamEventHorizon(this.teamId);

    if (!this.timelineViewModel)
      return;

    if (!this.timelineContainer)
      throw new Error("Couldn't find the timeline container.");

    const timelineViewOptions = this.eventHorizonRenderingService.getViewOptions(this.timelineViewModel);
    const visibleDataItems = await this.buildTimelineDataSet(this.timelineViewModel);

    this.timeline = new Timeline(
      this.timelineContainer.nativeElement,
      visibleDataItems,
      this.timelineViewModel.game.challengeSpecs.map(c => {
        const teamChallengeInstance = this.timelineViewModel?.team.challenges.find(i => i.specId == c.id);
        return {
          id: c.id,
          title: c.name,
          content: `
          <h1 class="clonk-on-me">${c.name}</h1>
          <h2>
            ${teamChallengeInstance ? `${teamChallengeInstance.id.substring(0, 6)} &middot; ${teamChallengeInstance.score}/${c.maxPossibleScore} points` : "unlaunched"}
          </h2>
`
        };
      }),
      timelineViewOptions
    );

    this.timeline.on("select", ev => {
      if (ev.items.length) {
        this.handleEventSelected(ev.items[0]);
        this.timeline?.setSelection([]);
      }
    });
  }

  ngOnDestroy(): void {
    this.timeline?.destroy();
  }

  protected async handleEventSelected(eventId: string) {
    if (!this.timelineViewModel) {
      this.logService.logError("Couldn't handle event selection - timeline not loaded.");
      return;
    }

    const timelineEvent = this.eventHorizonService.getEventId(eventId, this.timelineViewModel);
    const spec = this.eventHorizonService.getSpecForEventId(this.timelineViewModel, timelineEvent.id);
    const bodyContent = this.eventHorizonRenderingService.toModalMarkdown(timelineEvent, spec);

    if (!bodyContent) {
      return;
    }

    await this.clipboardService.copy(bodyContent);
    this.toastService.showMessage(`Copied this **${this.eventHorizonRenderingService.toFriendlyName(timelineEvent.type)}** event to your clipboard.`);
  }

  protected async handleEventTypeToggled(eventType: EventHorizonEventType) {
    if (!this.timelineViewModel)
      return;

    if (this.selectedEventTypes.some(t => t === eventType)) {
      this.selectedEventTypes = [...this.selectedEventTypes.filter(t => t !== eventType)];
    }
    else {
      // need to actually create a new array rather than .push so change detection catches it
      this.selectedEventTypes = [...this.selectedEventTypes, eventType];
    }

    this.buildTimelineDataSet(this.timelineViewModel);
  }

  private async buildTimelineDataSet(eventHorizon?: TeamEventHorizonViewModel): Promise<EventHorizonDataItem[]> {
    if (!eventHorizon || !this.timelineViewModel) {
      this.timeline?.setItems([]);
      return [];
    }

    const visibleDataItems: EventHorizonDataItem[] = [];

    for (const event of eventHorizon.team.events) {
      if (this.selectedEventTypes.indexOf(event.type) >= 0) {
        const spec = this.eventHorizonService.getSpecForEventId(this.timelineViewModel, event.id);
        visibleDataItems.push(await this.eventHorizonRenderingService.toDataItem(event, spec));
      }
    }

    this.timeline?.setItems(visibleDataItems);
    return visibleDataItems;
  }
}
