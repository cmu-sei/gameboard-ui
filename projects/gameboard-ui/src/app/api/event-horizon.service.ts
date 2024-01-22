import { Injectable } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { DateTime } from 'luxon';
import { EventHorizonGenericEvent, EventHorizonEventType, EventHorizonEvent, TeamEventHorizonViewModel, EventHorizonChallengeSpec } from './event-horizon.models';

@Injectable({ providedIn: 'root' })
export class EventHorizonService {
  constructor() { }

  async getTeamEventHorizon(teamId: string): Promise<TeamEventHorizonViewModel> {
    const fakeData = await firstValueFrom(of(this.buildFakeData(teamId)));
    return fakeData;
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
      "challengeDeployed",
      "gamespaceStarted",
      "gamespaceStopped",
      "solveComplete",
      "submissionRejected",
      "submissionScored"
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
            specId: "0882a1bd-a14c-4056-b1d9-318893b492f6"
          },
          {
            id: "bcdf2162-ef57-4c3a-a643-731577c14c1c",
            specId: "d47f6c8e-7776-4a0a-984e-bff95cfab76a",
          }
        ],
        events: [
          {
            id: "ef42946b-81c8-4dfe-8851-60301d964607",
            challengeId: "6fc45c53-7e7b-4996-89a9-6b43950c0f74",
            type: "challengeDeployed",
            timestamp: sessionStart.plus({ minutes: 2 })
          } as EventHorizonGenericEvent,
          {
            id: "39f97dcd-1915-4e5b-b78b-48c3c27f6c24",
            challengeId: "6fc45c53-7e7b-4996-89a9-6b43950c0f74",
            type: "submissionScored",
            timestamp: sessionStart.plus({ minutes: 27 }),
            submissionScoredEventData: {
              score: 0,
              attemptNumber: 1,
              answers: ["deadbeef", "REDRUM", "p@ssw0rd"]
            },
          },
          {
            id: "9b92cff5-93ea-4da8-b152-550fc94af57d",
            challengeId: "6fc45c53-7e7b-4996-89a9-6b43950c0f74",
            type: "submissionScored",
            timestamp: sessionStart.plus({ minutes: 33 }),
            submissionScoredEventData: {
              score: 15,
              attemptNumber: 2,
              answers: ["feedbeef", "LOUD NOISES", "a hexcode"]
            }
          },
          {
            id: "b08bc511-b698-4409-9eea-884fa5733a27",
            challengeId: "6fc45c53-7e7b-4996-89a9-6b43950c0f74",
            type: "gamespaceStopped",
            timestamp: sessionStart.plus({ minutes: 41 })
          },
          {
            id: "84bf22a3-435e-49fb-891a-59c841228448",
            challengeId: "6fc45c53-7e7b-4996-89a9-6b43950c0f74",
            type: "gamespaceStarted",
            timestamp: sessionStart.plus({ minutes: 92 })
          },
          {
            id: "eb9e4ec8-a780-4256-8588-4e21bea8b781",
            challengeId: "6fc45c53-7e7b-4996-89a9-6b43950c0f74",
            type: "submissionScored",
            timestamp: sessionStart.plus({ minutes: 136 }),
            submissionScoredEventData: {
              score: 175,
              attemptNumber: 3,
              answers: ["feedbeef", "softer noises", "Argh"]
            }
          },
          {
            id: "0c22b40c-eee8-4ae4-b6cd-cb077b30b9c9",
            challengeId: "6fc45c53-7e7b-4996-89a9-6b43950c0f74",
            type: "submissionScored",
            timestamp: sessionStart.plus({ minutes: 214 }),
            submissionScoredEventData: {
              score: 175,
              attemptNumber: 4,
              answers: ["feedbeef", "softer noises", "it's not going to happen, is it?"]
            }
          },
          {
            id: "149e0837-dd05-4ca2-91e8-bbe8f27a2081",
            challengeId: "bcdf2162-ef57-4c3a-a643-731577c14c1c",
            type: "challengeDeployed",
            timestamp: sessionStart.plus({ minutes: 42 })
          },
          {
            id: "ffcccf8b-eff0-437e-b268-b58f749cc26f",
            challengeId: "bcdf2162-ef57-4c3a-a643-731577c14c1c",
            type: "submissionScored",
            timestamp: sessionStart.plus({ minutes: 67 }),
            submissionScoredEventData: {
              score: 0,
              attemptNumber: 1,
              answers: ["omghalp", "this can't be right"]
            }
          },
          {
            id: "ad82e2df-7ae9-4c12-beba-18fba6172f86",
            challengeId: "bcdf2162-ef57-4c3a-a643-731577c14c1c",
            type: "submissionScored",
            timestamp: sessionStart.plus({ minutes: 82 }),
            submissionScoredEventData: {
              score: 80,
              attemptNumber: 2,
              answers: ["yay", "omg what's the answer"]
            }
          },
          {
            id: "d3d2e4b8-7053-4a2a-a190-7ed84e71218c",
            challengeId: "bcdf2162-ef57-4c3a-a643-731577c14c1c",
            type: "submissionScored",
            timestamp: sessionStart.plus({ minutes: 91 }),
            submissionScoredEventData: {
              score: 100,
              attemptNumber: 3,
              answers: ["yay", "the answer, weirdly, is also 'yay'"]
            }
          },
          {
            id: "2c3d551e-9b47-486f-99c9-9b4ea1d4802b",
            challengeId: "bcdf2162-ef57-4c3a-a643-731577c14c1c",
            type: "solveComplete",
            timestamp: sessionStart.plus({ minutes: 91, seconds: 2 }),
            solveCompleteEventData: {
              attemptsUsed: 3,
              finalScore: 100
            }
          }
        ]
      }
    };
  }
}
