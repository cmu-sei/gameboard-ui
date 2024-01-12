import { TeamEventHorizonViewModel } from '@/api/event-horizon.models';
import { EventHorizonService } from '@/api/event-horizon.service';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DataSet } from 'vis-data';
import { Timeline, DataItem, DataSetDataItem } from 'vis-timeline/esnext';

@Component({
  selector: 'app-team-event-horizon',
  templateUrl: './team-event-horizon.component.html',
  styleUrls: ['./team-event-horizon.component.scss']
})
export class TeamEventHorizonComponent implements AfterViewInit {
  @Input() teamId = "";
  @ViewChild("timelineContainer") timelineContainer?: ElementRef;

  constructor(private eventHorizonService: EventHorizonService) { }

  async ngAfterViewInit(): Promise<void> {
    if (!this.teamId)
      throw new Error("Can't use the team event horizon component without a team Id.");
    if (!this.timelineContainer)
      throw new Error("Couldn't find the timeline container.");

    // Create a Timeline
    // (apparently this just does the thing, which is weird, but whatever)
    const timelineData = await this.eventHorizonService.getTeamEventHorizon(this.teamId);
    const dataItems = this.buildTimelineDataSet(timelineData);
    const timeline = new Timeline(
      this.timelineContainer.nativeElement,
      dataItems,
      timelineData.team.challenges.map(c => ({
        id: c.id,
        content: c.name
      })),
      timelineData.viewOptions
    );
  }

  private buildTimelineDataSet(eventHorizon: TeamEventHorizonViewModel) {
    let dataSetEvents: DataItem[] = [];

    for (let challenge of eventHorizon.team.challenges) {
      dataSetEvents = [...dataSetEvents, ...challenge.events.map(ev => ({
        id: ev.id,
        content: `${challenge.name} -> ${ev.type} :: ${ev.timestamp}`,
        start: ev.timestamp.toISO(),
        title: `Title ${challenge.name}`,
        // type: "point",
        group: challenge.id
      }))];
    }

    return dataSetEvents;
  }
}
