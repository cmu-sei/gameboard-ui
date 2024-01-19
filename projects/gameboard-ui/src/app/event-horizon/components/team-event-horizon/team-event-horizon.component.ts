import { EventHorizonDataItem, EventHorizonEventType, TeamEventHorizonViewModel } from '@/api/event-horizon.models';
import { EventHorizonService } from '@/api/event-horizon.service';
import { EventHorizonRenderingService } from '@/services/event-horizon-rendering.service';
import { LogService } from '@/services/log.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import { Timeline, DataItem } from 'vis-timeline/esnext';

@Component({
  selector: 'app-team-event-horizon',
  templateUrl: './team-event-horizon.component.html',
  styleUrls: ['./team-event-horizon.component.scss']
})
export class TeamEventHorizonComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() teamId = "";
  @ViewChild("timelineContainer") timelineContainer?: ElementRef;

  protected selectedEventTypes: EventHorizonEventType[] = [];
  protected allEventTypes: EventHorizonEventType[] = [];
  private timeline?: Timeline;

  private timelineViewModel?: TeamEventHorizonViewModel;
  private visibleDataItems: EventHorizonDataItem[] = [];

  constructor(
    private eventHorizonService: EventHorizonService,
    private eventHorizonRenderingService: EventHorizonRenderingService,
    private logService: LogService,
    private modalService: ModalConfirmService) { }

  ngOnInit() {
    // load available event types
    const eventTypes = this.eventHorizonService.getEventTypes().filter(t => t !== "submissionRejected");
    this.allEventTypes = [...eventTypes];
    this.selectedEventTypes = [...eventTypes];
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.teamId)
      throw new Error("Can't use the team event horizon component without a team Id.");
    if (!this.timelineContainer)
      throw new Error("Couldn't find the timeline container.");

    // Create a Timeline
    // (apparently this just does the thing, which is weird, but whatever)
    this.timelineViewModel = await this.eventHorizonService.getTeamEventHorizon(this.teamId);
    this.buildTimelineDataSet(this.timelineViewModel);

    this.timeline = new Timeline(
      this.timelineContainer.nativeElement,
      this.visibleDataItems,
      this.timelineViewModel.game.challengeSpecs.map(c => ({
        id: c.id,
        content: c.name
      })),
      this.timelineViewModel.viewOptions
    );

    this.timeline.on("select", async ev => {
      if (ev.items.length) {
        await this.handleEventSelected(ev.items[0]);
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

    this.modalService.openConfirm({
      title: `${spec.name}: ${this.eventHorizonRenderingService.toFriendlyName(timelineEvent.type)}`,
      subtitle: `${timelineEvent.timestamp.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}`,
      bodyContent: this.eventHorizonRenderingService.toModalContent(timelineEvent, spec),
      renderBodyAsMarkdown: true,
      hideCancel: true
    });
  }

  protected async handleEventTypeToggled(eventType: EventHorizonEventType) {
    if (this.selectedEventTypes.some(t => t === eventType)) {
      this.selectedEventTypes = [...this.selectedEventTypes.filter(t => t !== eventType)];
    }
    else {
      // need to actually create a new array rather than .push so change detection catches it
      this.selectedEventTypes = [...this.selectedEventTypes, eventType];
    }

    this.buildTimelineDataSet(this.timelineViewModel);
  }

  private buildTimelineDataSet(eventHorizon?: TeamEventHorizonViewModel) {
    if (!eventHorizon || !this.timelineViewModel) {
      this.timeline?.setItems([]);
      return;
    }

    const visibleDataItems: EventHorizonDataItem[] = [];

    for (const event of eventHorizon.team.events) {
      if (!this.selectedEventTypes?.length || this.selectedEventTypes.indexOf(event.type) >= 0) {
        const spec = this.eventHorizonService.getSpecForEventId(this.timelineViewModel, event.id);
        visibleDataItems.push(this.eventHorizonRenderingService.toDataItem(event, spec));
      }
    }

    this.timeline?.setItems(visibleDataItems);
  }
}
