// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { AnswerSubmission, BoardSpec, Challenge } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { TimeWindow } from '../../api/player-models';
import { Observable, Subject, catchError, delay, filter, firstValueFrom, interval, map, of, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { ChallengesService } from '@/api/challenges.service';
import { NotificationService } from '@/services/notification.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ChallengeSubmissionAnswers, ChallengeSubmissionViewModel, GetChallengeSubmissionsResponse } from '@/api/challenges.models';
import { ToastService } from '@/utility/services/toast.service';

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
export class GamespaceQuizComponent implements OnInit, OnChanges {
  @Input() challengeId?: string;
  @Input() spec!: BoardSpec;
  @Input() session!: TimeWindow;
  @Output() graded = new EventEmitter<boolean>();

  protected errors: any[] = [];
  protected fa = fa;
  protected pastSubmissions: ChallengeSubmissionViewModel[] = [];
  protected pending = false;
  protected pendingAnswers: ChallengeSubmissionAnswers = {
    questionSetIndex: 0,
    answers: []
  };
  protected timeRemaining$?: Observable<number> = of(0);

  private _answersSubmitted$ = new Subject<PendingSubmissionsUpdate>();
  private _updatePendingAnswers$ = new Subject<PendingSubmissionsUpdate>();

  constructor(
    private api: BoardService,
    private challengesService: ChallengesService,
    private teamHub: NotificationService,
    private toastsService: ToastService,
    private unsub: UnsubscriberService) { }

  ngOnInit(): void {
    this.unsub.add(
      // After the player inputs anything and then doesn't change it for 5 seconds,
      // update their unsubmitted answers (we keep one set of unsubmitted answers per challenge).
      //
      // this is a lot like debounceTime, but we allow it to be interrupted
      // and flushed if the user submits answers during the debounce window
      this._updatePendingAnswers$.pipe(
        switchMap(update => of(update).pipe(
          delay(3000),
          takeUntil(this._answersSubmitted$)
        )),
        switchMap(update => this.challengesService.savePendingSubmission(update.challengeId, {
          questionSetIndex: update.sectionIndex,
          answers: update.answers
        }))
      ).subscribe(),

      // save submitted answers (interrupting auto-save above as a side effect)
      // and reload form data with the results
      this._answersSubmitted$.pipe(
        tap(submission => {
          this.pending = true;
          this.errors = [];
        }),
        filter(submission => !!submission),
        tap(submission => this.pending = true),
        switchMap(submission => this.challengesService.grade({
          id: submission.challengeId,
          sectionIndex: submission.sectionIndex,
          questions: this.pendingAnswers
            .answers
            .map(a => ({ answer: a || "" } as AnswerSubmission))
        })),
        catchError((err, caughtChallenge) => {
          this.errors.push(err);
          this.pending = false;
          this.resetPendingAnswers();

          return caughtChallenge;
        }),
        tap(challenge => {
          this.pending = false;
          if (!challenge)
            return;

          this.resetPendingAnswers();
          this.handleChallengeUpdated(challenge);
        }),
        switchMap(challenge => this.challengesService.getSubmissions(challenge.id)),
        tap(submissions => this.handleSubmissionsRetrieved(submissions))
      ).subscribe()
    );
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    const currentChallengeId = this.spec.instance?.id;
    const previousChallengeId = changes.spec?.previousValue?.instance?.id;

    // on the first time we get a real challengeId that is different from the previous one, or if we haven't set up
    // the object we're going to bind the inputs to for the answers...
    if (currentChallengeId && (currentChallengeId !== previousChallengeId || !this.pendingAnswers.answers.length)) {
      // the default state is a blank set of answers, but we might update these later from a previous submission
      this.resetPendingAnswers();

      const pastSubmissions = await firstValueFrom(this.challengesService.getSubmissions(currentChallengeId));
      this.handleSubmissionsRetrieved(pastSubmissions);
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
    if (!this.spec.instance) {
      throw new Error("Can't submit responses with no challenge loaded.");
    }
    this._answersSubmitted$.next({
      challengeId: this.spec.instance.id,
      sectionIndex: this.spec.instance?.state.challenge?.sectionIndex || 0,
      answers: this.pendingAnswers.answers
    });
  }

  protected handleAnswerInput(args: { challengeId: string, sectionIndex: number, answers: string[] }) {
    // save the unsubmitted answers (after a debounce period)
    this._updatePendingAnswers$.next({
      challengeId: args.challengeId,
      sectionIndex: args.sectionIndex,
      answers: args.answers
    });
  }

  private async handleChallengeUpdated(challenge: Challenge) {
    this.spec.instance = challenge;
    this.api.setColor(this.spec);

    const submissions = await firstValueFrom(this.challengesService.getSubmissions(challenge.id));
    this.handleSubmissionsRetrieved(submissions);

    this.graded.emit(true);
  }

  private handleSubmissionsRetrieved(submissions: GetChallengeSubmissionsResponse) {
    // if somehow we don't have an instance, this doesn't matter
    if (!this.spec.instance)
      return;

    // determine if we have past submitted answers for question set of this challenge
    const numberOfQuestions = this.pendingAnswers?.answers.length || 0;
    this.pastSubmissions = [];

    // if we have previous submissions for the question set of the expected length,
    // make them available to the view by storing it on pastSubmissions.
    const sectionIndex = this.spec.instance?.state.challenge.sectionIndex || 0;
    if (submissions.submittedAnswers.length) {
      this.pastSubmissions = submissions.submittedAnswers
        .filter(s => s.sectionIndex == sectionIndex && s.answers.length == numberOfQuestions);
    }

    // attempt to restore pending (unsubmitted) answers under these conditions
    // if we also have a pending submission, use that to autofill the responses to the questions
    if (!submissions.pendingAnswers) {
      // no pending answers, so our job is done
      this.resetPendingAnswers();
      return;
    }

    const hasPendingAnswers = submissions.pendingAnswers.answers.some(a => !!a);
    const canPlayCurrentChallenge = this.session?.isDuring && this.spec.instance?.state.isActive;
    const isMatchingSectionIndex = submissions.pendingAnswers.questionSetIndex == sectionIndex;
    const isMatchingLength = submissions.pendingAnswers.answers.length == numberOfQuestions;

    if (hasPendingAnswers && isMatchingLength && isMatchingSectionIndex && canPlayCurrentChallenge) {
      this.pendingAnswers = {
        questionSetIndex: sectionIndex,
        answers: [...submissions.pendingAnswers.answers]
      };

      for (let i = 0; i < numberOfQuestions; i++) {
        this.pendingAnswers.answers[i] = submissions.pendingAnswers.answers[i];
      }

      if (!this.session.isAfter) {
        this.toastsService.showMessage("Looks like you've been here before! We automatically restored your unsubmitted answers.");
      }
    }
  }

  // the player's submissions are bound to the pendingAnswers property of this class.
  // upon any submission for the challenge, we need to update the pending answers array with:
  //   - an empty string for incorrectly answered questions
  //   - the correct answer for any correctly answered questions
  // both of these are because the game engine gets unhappy if you don't resubmit answers
  // which have already been marked correct or pass nulls for any questions.
  // 2) Ensure correct answers 
  private resetPendingAnswers() {
    if (!this.spec.instance)
      throw new Error("Can't reset pending answers with no loaded challenge.");

    const numberOfQuestions = this.spec.instance.state.challenge.questions.length;
    this.pendingAnswers = {
      questionSetIndex: this.spec.instance.state.challenge.sectionIndex || 0,
      answers: new Array<string>(numberOfQuestions)
    };

    for (let i = 0; i < numberOfQuestions; i++) {
      if (this.spec.instance.state.challenge.questions[i].isCorrect) {
        this.pendingAnswers.answers[i] = this.spec.instance.state.challenge.questions[i].answer;
      }
      else {
        this.pendingAnswers.answers[i] = "";
      }
    }
  }

  // for a much healthier component (someday)
  //   export interface GamespaceQuizContext {
  //   answerSections: {
  //     sectionIndex: number;
  //     answers: { answer: string }[];
  //   }[],
  //   challenge: {
  //     id: string;
  //     specId: string;
  //     teamId: string;
  //     isDeployed: boolean
  //   },
  //   session: {
  //     endDate: Date
  //   }
  // }

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
  //       endDate: challenge.endTime.valueOf()e,

  //     }
  //   };
  // }
}
