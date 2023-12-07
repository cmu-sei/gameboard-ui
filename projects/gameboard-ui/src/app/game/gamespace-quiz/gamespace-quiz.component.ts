// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { BoardSpec, Challenge, QuestionView } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { TimeWindow } from '../../api/player-models';
import { Subject, firstValueFrom } from 'rxjs';
import { ChallengesService } from '@/api/challenges.service';
import { NotificationService } from '@/services/notification.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ChallengeSubmissionViewModel, GetChallengeSubmissionsResponse } from '@/api/challenges.models';

export interface GamespaceQuizContext {
  answerSections: {
    sectionIndex: number;
    answers: { answer: string }[];
  }[],
  challenge: {
    id: string;
    specId: string;
    teamId: string;
    isDeployed: boolean
  },
  session: {
    msRemaining: number;
    isActive: boolean;
  }
}

interface PendingSubmissionsUpdate {
  challengeId: string;
  sectionIndex: number;
  answers: string[];
}

@Component({
  selector: 'app-gamespace-quiz',
  templateUrl: './gamespace-quiz.component.html',
  styleUrls: ['./gamespace-quiz.component.scss']
})
export class GamespaceQuizComponent implements OnChanges {
  @Input() spec!: BoardSpec;
  @Input() session!: TimeWindow;
  @Output() graded = new EventEmitter<boolean>();

  pending = false;
  errors: any[] = [];
  protected fa = fa;
  protected pastSubmissions: ChallengeSubmissionViewModel[] = [];
  private _updatePendingAnswers$ = new Subject<PendingSubmissionsUpdate>();

  constructor(
    private api: BoardService,
    private challengesService: ChallengesService,
    private teamHub: NotificationService,
    private unsub: UnsubscriberService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.spec.instance?.id && this.spec.instance?.id !== changes.spec?.previousValue.id) {
      // check to see if they have any saved answers for this challenge - autofill if so
      const submissions = await firstValueFrom(this.challengesService.getSubmissions(this.spec.instance.id));
      this.handleSubmissionsRetrieved(submissions);
    }
    else {
      this.pastSubmissions = [];
    }

    if (this.spec.instance?.teamId && changes?.spec?.previousValue?.instance?.teamId !== this.spec?.instance?.teamId) {
      this.teamHub.init(this.spec.instance!.teamId);

      this.unsub.add(
        // updates from the hub (like from the challenge grading server, say)
        this.teamHub.challengeEvents.subscribe(c => {
          this.handleChallengeUpdated(c.model);
        }),
      );
    }
  }

  async submit(): Promise<void> {
    this.pending = true;
    this.errors = [];

    const submission = {
      id: this.spec.instance!.id,
      sectionIndex: this.spec.instance!.state.challenge?.sectionIndex || 0,
      questions: this.spec.instance!.state.challenge?.questions?.map(q => ({ answer: q.answer })),
    };

    try {
      const gradedChallenge = await firstValueFrom(this.challengesService.grade(submission));
      this.handleChallengeUpdated(gradedChallenge);
    }
    catch (err) {
      this.errors.push(err);
    }

    this.pending = false;
  }

  protected handleAnswerInput(args: { challengeId: string, sectionIndex: number, questions: QuestionView[] }) {
    this._updatePendingAnswers$.next({
      challengeId: args.challengeId,
      sectionIndex: args.sectionIndex,
      answers: args.questions.map(q => q.answer)
    });
  }

  private handleChallengeUpdated(challenge: Challenge) {
    this.spec.instance = challenge;
    this.api.setColor(this.spec);
    this.graded.emit(true);
  }

  private handleSubmissionsRetrieved(submissions: GetChallengeSubmissionsResponse) {
    // determine if we have past submitted answers for question set of this challenge
    this.pastSubmissions = [];

    const sectionIndex = this.spec.instance?.state.challenge.sectionIndex || 0;
    if (submissions.submittedAnswers.length) {
      this.pastSubmissions = submissions.submittedAnswers
        .filter(s => s.sectionIndex == sectionIndex && s.answers.length == this.spec.instance?.state.challenge.questions.length);
    }
  }

  // private toContext(challenge: Challenge): GamespaceQuizContext {
  //   return {
  //     answerSections: [
  //       {
  //         sectionIndex: challenge.state.challenge?.sectionIndex || 0,
  //         answers: challenge.state.challenge.questions.map(q => ({ answer: q.answer }))
  //       }
  //     ],
  //     challenge: {
  //       id: challenge.id,
  //       isDeployed: challenge.state.isActive,
  //       specId: challenge.specId,
  //       teamId: challenge.teamId,
  //     },
  //     session: {
  //       msRemaining: challenge.endTime.valueOf() - challenge.startTime.valueOf(),

  //     }
  //   };
  // }
}
