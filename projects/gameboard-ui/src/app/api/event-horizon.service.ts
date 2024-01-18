import { Injectable } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { DateTime } from 'luxon';
import { EventHorizonChallenge, EventHorizonGenericEvent, EventHorizonEventType, EventHorizonEvent, EventHorizonSolveCompleteEvent, EventHorizonSubmissionScoredEvent, TeamEventHorizonViewModel, EventHorizonDataItem } from './event-horizon.models';
import { DataItem } from 'vis-timeline';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
import { MarkdownService } from 'ngx-markdown';

@Injectable({ providedIn: 'root' })
export class EventHorizonService {
  constructor(
    private markdownService: MarkdownService,
    private markdownHelpers: MarkdownHelpersService) { }

  async getTeamEventHorizon(teamId: string, eventTypes?: EventHorizonEventType[]): Promise<TeamEventHorizonViewModel> {
    const fakeData = await firstValueFrom(of(this.buildFakeData(teamId)));

    for (const challenge of fakeData.team.challenges) {
      if (eventTypes?.length) {
        challenge.events = challenge.events.filter(e => eventTypes.indexOf(e.type) >= 0);
      }
    }

    return fakeData;
  }

  getEventId(eventId: string, timeline: TeamEventHorizonViewModel): EventHorizonEvent {
    for (const challenge of timeline.team.challenges) {
      for (const event of challenge.events) {
        if (event.id === eventId)
          return event;
      }
    }

    throw new Error(`Couldn't find an event with Id "${eventId}" in event timeline for team ${timeline.team.id}.`);
  }

  getEventTypes(): EventHorizonEventType[] {
    return Object.keys(EventHorizonEventType).map(k => k as EventHorizonEventType);
  }

  private buildFakeData(teamId: string): TeamEventHorizonViewModel {
    const sessionStart = DateTime.fromJSDate(new Date(2024, 0, 2, 15));
    const sessionEnd = sessionStart.plus({ hours: 4 });

    return {
      game: {
        id: "9e772340-f115-4168-a9d8-71c8c6836553",
        name: "PC6 Track A Round 1",
        challengeSpecs: [
          {
            id: "0882a1bd-a14c-4056-b1d9-318893b492f6",
            name: "An Intimidating Start",
            maxAttempts: 5,
            maxPossibleScore: 200,
          },
          {
            id: "d47f6c8e-7776-4a0a-984e-bff95cfab76a",
            name: "A Thrilling Conclusion",
            maxAttempts: 4,
            maxPossibleScore: 100
          }
        ]
      },
      team: {
        id: teamId,
        name: "Ben, Medium Competitor",
        session: {
          start: sessionStart,
          end: sessionEnd
        },
        challenges: [
          {
            id: "6fc45c53-7e7b-4996-89a9-6b43950c0f74",
            specId: "0882a1bd-a14c-4056-b1d9-318893b492f6",
            name: "An Intimidating Start",
            maxAttempts: 5,
            events: [
              {
                id: "ef42946b-81c8-4dfe-8851-60301d964607",
                type: EventHorizonEventType.ChallengeDeployed,
                timestamp: sessionStart.plus({ minutes: 2 })
              } as EventHorizonGenericEvent,
              {
                id: "39f97dcd-1915-4e5b-b78b-48c3c27f6c24",
                type: EventHorizonEventType.SubmissionScored,
                timestamp: sessionStart.plus({ minutes: 27 }),
                submissionScoredEventData: {
                  score: 0,
                  attemptNumber: 1,
                  answers: ["deadbeef", "REDRUM", "p@ssw0rd"]
                },
              },
              {
                id: "9b92cff5-93ea-4da8-b152-550fc94af57d",
                type: EventHorizonEventType.SubmissionScored,
                timestamp: sessionStart.plus({ minutes: 33 }),
                submissionScoredEventData: {
                  score: 15,
                  attemptNumber: 2,
                  answers: ["feedbeef", "LOUD NOISES", "a hexcode"]
                }
              },
              {
                id: "b08bc511-b698-4409-9eea-884fa5733a27",
                type: EventHorizonEventType.GamespaceStopped,
                timestamp: sessionStart.plus({ minutes: 41 })
              },
              {
                id: "84bf22a3-435e-49fb-891a-59c841228448",
                type: EventHorizonEventType.GamespaceStarted,
                timestamp: sessionStart.plus({ minutes: 92 })
              },
              {
                id: "eb9e4ec8-a780-4256-8588-4e21bea8b781",
                type: EventHorizonEventType.SubmissionScored,
                timestamp: sessionStart.plus({ minutes: 136 }),
                submissionScoredEventData: {
                  score: 175,
                  attemptNumber: 3,
                  answers: ["feedbeef", "softer noises", "Argh"]
                }
              },
              {
                id: "0c22b40c-eee8-4ae4-b6cd-cb077b30b9c9",
                type: EventHorizonEventType.SubmissionScored,
                timestamp: sessionStart.plus({ minutes: 214 }),
                submissionScoredEventData: {
                  score: 175,
                  attemptNumber: 4,
                  answers: ["feedbeef", "softer noises", "it's not going to happen, is it?"]
                }
              }
            ]
          },
          {
            id: "bcdf2162-ef57-4c3a-a643-731577c14c1c",
            specId: "d47f6c8e-7776-4a0a-984e-bff95cfab76a",
            name: "A Thrilling Conclusion",
            maxAttempts: 4,
            events: [
              {
                id: "149e0837-dd05-4ca2-91e8-bbe8f27a2081",
                type: EventHorizonEventType.ChallengeDeployed,
                timestamp: sessionStart.plus({ minutes: 42 })
              },
              {
                id: "ffcccf8b-eff0-437e-b268-b58f749cc26f",
                type: EventHorizonEventType.SubmissionScored,
                timestamp: sessionStart.plus({ minutes: 67 }),
                submissionScoredEventData: {
                  score: 0,
                  attemptNumber: 1,
                  answers: ["omghalp", "this can't be right"]
                }
              },
              {
                id: "ad82e2df-7ae9-4c12-beba-18fba6172f86",
                type: EventHorizonEventType.SubmissionScored,
                timestamp: sessionStart.plus({ minutes: 82 }),
                submissionScoredEventData: {
                  score: 80,
                  attemptNumber: 2,
                  answers: ["yay", "omg what's the answer"]
                }
              },
              {
                id: "d3d2e4b8-7053-4a2a-a190-7ed84e71218c",
                type: EventHorizonEventType.SubmissionScored,
                timestamp: sessionStart.plus({ minutes: 91 }),
                submissionScoredEventData: {
                  score: 100,
                  attemptNumber: 3,
                  answers: ["yay", "the answer, weirdly, is also 'yay'"]
                }
              },
              {
                id: "2c3d551e-9b47-486f-99c9-9b4ea1d4802b",
                type: EventHorizonEventType.SolveComplete,
                timestamp: sessionStart.plus({ minutes: 91, seconds: 2 }),
                solveCompleteEventData: {
                  attemptsUsed: 3,
                  finalScore: 100
                }
              }
            ]
          }
        ]
      },
      viewOptions: {
        align: "left",
        end: sessionEnd.toJSDate(),
        min: sessionStart.toJSDate(),
        max: sessionEnd.toJSDate(),
        selectable: true,
        start: sessionStart.toJSDate(),
        zoomMax: 1000 * 60 * 60 * 4
      }
    };
  }
}
