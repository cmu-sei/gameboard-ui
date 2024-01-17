import { EventHorizonEvent, EventHorizonEventType, TeamEventHorizonViewModel } from '@/api/event-horizon.models';
import { EventHorizonService } from '@/api/event-horizon.service';
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

  protected eventTypeSelections: { [key: string]: boolean } = {};
  protected allEventTypes: EventHorizonEventType[] = [];
  private timeline?: Timeline;
  private dataItems: DataItem[] = [];

  constructor(private eventHorizonService: EventHorizonService) { }

  ngOnInit() {
    // load available event types
    const eventTypes = this.eventHorizonService.getEventTypes();
    this.allEventTypes = [...eventTypes];

    for (const eventType of eventTypes) {
      this.eventTypeSelections[eventType] = true;
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.teamId)
      throw new Error("Can't use the team event horizon component without a team Id.");
    if (!this.timelineContainer)
      throw new Error("Couldn't find the timeline container.");

    // Create a Timeline
    // (apparently this just does the thing, which is weird, but whatever)
    const timelineData = await this.eventHorizonService.getTeamEventHorizon(this.teamId);
    this.dataItems = this.buildTimelineDataSet(timelineData);

    this.timeline?.destroy();
    this.timeline = new Timeline(
      this.timelineContainer.nativeElement,
      this.dataItems,
      timelineData.team.challenges.map(c => ({
        id: c.specId,
        content: c.name
      })),
      timelineData.viewOptions
    );
  }

  ngOnDestroy(): void {
    this.timeline?.destroy();
  }

  protected async handleEventTypeToggled(eventType: EventHorizonEventType) {
    this.eventTypeSelections[eventType] = !this.eventTypeSelections[eventType];
    this.load();
  }

  private buildTimelineDataSet(eventHorizon: TeamEventHorizonViewModel) {
    let dataSetEvents: DataItem[] = [];

    for (let challenge of eventHorizon.team.challenges) {
      for (let event of challenge.events) {
        if (!this.eventTypeSelections?.length || this.eventTypeSelections[event.type]) {
          dataSetEvents.push(this.eventHorizonService.toDataItem(event, challenge));
        }
      }
    }

    return dataSetEvents;
  }

  private async load() {


  }
}
