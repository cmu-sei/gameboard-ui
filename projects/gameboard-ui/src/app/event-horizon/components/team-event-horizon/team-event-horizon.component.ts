import { EventHorizonEventType, TeamEventHorizonViewModel } from '@/api/event-horizon.models';
import { EventHorizonService } from '@/api/event-horizon.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  private visibleDataItems: DataItem[] = [];

  constructor(
    private eventHorizonService: EventHorizonService,
    private modalService: ModalConfirmService) { }

  ngOnInit() {
    // load available event types
    const eventTypes = this.eventHorizonService.getEventTypes();
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
    this.visibleDataItems = this.buildTimelineDataSet(this.timelineViewModel);

    this.timeline = new Timeline(
      this.timelineContainer.nativeElement,
      this.visibleDataItems,
      this.timelineViewModel.team.challenges.map(c => ({
        id: c.specId,
        content: c.name
      })),
      this.timelineViewModel.viewOptions
    );

    this.timeline.on("select", ev => {
      this.timeline?.setSelection([]);
    });
  }

  ngOnDestroy(): void {
    this.timeline?.destroy();
  }

  protected async handleEventSelected(eventId: string) {

  }

  protected async handleEventTypeToggled(eventType: EventHorizonEventType) {
    if (this.selectedEventTypes.some(t => t === eventType)) {
      this.selectedEventTypes = [...this.selectedEventTypes.filter(t => t === eventType)];
    }
    else {
      this.selectedEventTypes.push(eventType);
    }

    this.buildTimelineDataSet(this.timelineViewModel);
  }

  private buildTimelineDataSet(eventHorizon?: TeamEventHorizonViewModel) {
    if (!eventHorizon) {
      this.visibleDataItems = [];
      return this.visibleDataItems;
    }

    this.visibleDataItems = [];

    for (let challenge of eventHorizon.team.challenges) {
      for (let event of challenge.events) {
        if (!this.selectedEventTypes?.length || this.selectedEventTypes.indexOf(event.type) >= 0) {
          this.visibleDataItems.push(this.eventHorizonService.toDataItem(event, challenge));
        }
      }
    }

    return this.visibleDataItems;
  }
}
