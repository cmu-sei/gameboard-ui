// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, of } from 'rxjs';
import { EventHorizonEventType, EventHorizonEvent, TeamEventHorizonViewModel, EventHorizonChallengeSpec, EventHorizonGamespaceOnOffEvent, EventHorizonTicketOpenCloseEvent } from './event-horizon.models';
import { ApiUrlService } from '@/services/api-url.service';
import { ApiDateTimeService } from '@/services/api-date-time.service';
import { LogService } from '@/services/log.service';

@Injectable({ providedIn: 'root' })
export class EventHorizonService {
  constructor(
    private apiDateTimeService: ApiDateTimeService,
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private log: LogService) { }

  async getTeamEventHorizon(teamId: string): Promise<TeamEventHorizonViewModel | null> {
    return await firstValueFrom(this.http.get<TeamEventHorizonViewModel>(this.apiUrl.build(`team/${teamId}/timeline`)).pipe(
      map(timeline => {
        if (!timeline)
          return null;

        const start = this.apiDateTimeService.toDateTime(timeline.team.session.start as any);
        const end = this.apiDateTimeService.toDateTime(timeline.team.session.end as any);

        if (!start) {
          this.log.logInfo("No start date for this team's timeline. Have they started their session?");
          return null;
        }

        timeline.team.session.start = start;
        timeline.team.session.end = end;

        for (const event of timeline.team.events) {
          const timestamp = this.apiDateTimeService.toDateTime(event.timestamp as any);
          if (!timestamp)
            throw new Error(`Couldn't parse datetime for timeline event: ${JSON.stringify(event.timestamp)}`);

          event.timestamp = timestamp;

          // if this is a gamespace event, its eventData has another property that needs help
          const asGamespaceEvent = event as EventHorizonGamespaceOnOffEvent;
          if (asGamespaceEvent.eventData?.offAt) {
            const offAtStamp = this.apiDateTimeService.toDateTime(asGamespaceEvent.eventData?.offAt as any);
            asGamespaceEvent.eventData.offAt = offAtStamp || undefined;
          }

          // also true of tickety events
          const asTicketEvent = event as EventHorizonTicketOpenCloseEvent;
          if (asTicketEvent.eventData?.closedAt) {
            const closedAtStamp = this.apiDateTimeService.toDateTime(asTicketEvent.eventData.closedAt as any);
            asTicketEvent.eventData.closedAt = closedAtStamp || undefined;
          }
        }

        return timeline;
      })
    ));
  }

  getEventId(eventId: string, timeline: TeamEventHorizonViewModel): EventHorizonEvent {
    for (const event of timeline.team.events) {
      if (event.id === eventId)
        return event;
    }

    throw new Error(`Couldn't find an event with Id "${eventId}" in event timeline for team ${timeline.team.id}.`);
  }

  getEventTypes(): EventHorizonEventType[] {
    // no great way to enumerate string literal types
    return [
      "challengeStarted",
      "gamespaceOnOff",
      "solveComplete",
      "submissionRejected",
      "submissionScored",
      "ticketOpenClose"
    ];
  }

  getSpecForEventId(timeline: TeamEventHorizonViewModel, eventId: string): EventHorizonChallengeSpec {
    const event = timeline.team.events.find(e => e.id == eventId);

    if (!event) {
      throw new Error(`Couldn't find event ${eventId}.`);
    }

    const specId = timeline.team.challenges.find(s => s.id === event.challengeId)?.specId;
    const spec = !specId ? null : timeline.game.challengeSpecs.find(s => s.id === specId);

    if (!spec) {
      throw new Error(`Couldn't resolve a challenge spec for event ${eventId}.`);
    }

    return spec;
  }
}
