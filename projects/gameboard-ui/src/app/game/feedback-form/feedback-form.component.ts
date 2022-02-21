import { Component, OnInit, ViewChild, Input, AfterViewInit } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { BoardSpec, Challenge, ChallengeView, GameState } from '../../api/board-models';
import { faCaretDown, faCaretRight, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, combineLatest, interval, merge, Observable, of, scheduled, Subject, Subscription, timer } from 'rxjs';
import { FeedbackService } from '../../api/feedback.service';
import { Feedback, QuestionType, FeedbackSubmission, FeedbackTemplate, FeedbackQuestion } from '../../api/feedback-models';
import { BoardGame } from '../../api/board-models';
import { catchError, combineAll, debounceTime, delay, filter, map, mergeAll, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { ThisReceiver } from '@angular/compiler';
import { TimeWindow } from '../../api/player-models';
import { Game } from '../../api/game-models';


@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss']
})
export class FeedbackFormComponent implements OnInit, AfterViewInit {
  @Input() title!: string;
  @Input() session!: TimeWindow;
  @Input() spec!: BoardSpec;
  @Input() specs$!: Observable<BoardSpec>;
  @Input() game!: Game | BoardGame;
  @Input() type!: string;
  @ViewChild(NgForm) form!: FormGroup;

  faSubmit = faCloudUploadAlt;
  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;

  feedbackForm: Feedback;
  errors: any[];
  pending: boolean;
  show: boolean = false;

  dirty: boolean = false;
  refreshSpec$ = new Subject<BoardSpec>();
  updated$!: Observable<any>;
  status: string = "";

  constructor(
    private api: FeedbackService
  ) {

    this.errors = [];
    this.pending = false;
    
    this.feedbackForm = {
      challengeId: "",
      questions: [],
      submitted: false
    };

   }

  ngOnInit(): void {
    if (this.type == "game") {
      this.onInitGame();
    } else if (this.type == "challenge") {
      this.onInitChallenge();
    }
  }

  onInitGame() {
    this.api.retrieve({gameId: this.game.id}).subscribe(
      feedback => {
        this.updateFeedback(feedback, this.game.feedbackTemplate.board);
      },
      (err: any) => {}
    )
  }

  onInitChallenge() {
    const fetch$ = merge(
      this.specs$,
      this.refreshSpec$
    ).pipe(
      tap(spec => this.spec = spec),
      switchMap(spec => this.api.retrieve({
        challengeSpecId: spec.id,
        gameId: this.game.id
      }))
    ).subscribe(feedback => {
      this.updateFeedback(feedback, this.game.feedbackTemplate.challenge)
      if (!this.spec.instance?.state.isActive) {
        this.show = true;
      } else {
        this.show = false;
      }
      if (feedback?.submitted) {
        this.show = false;
      }
    });

    this.refreshSpec$.next(this.spec);
  }

  updateFeedback(feedback: Feedback, template: FeedbackQuestion[]) {
    if (feedback == null || feedback.questions.length == 0) {
      this.feedbackForm.questions = template;
      this.feedbackForm.submitted = false;
    } else {
      this.feedbackForm.questions = feedback.questions;
      // todo, maybe instead still populate everything with challenge template and
      // then go in and insert answers when ids match
      this.feedbackForm.submitted = feedback.submitted;
    }
  }

  ngAfterViewInit(): void {
    this.updated$ = this.form.valueChanges.pipe(
      filter(f => !this.form.pristine && !this.feedbackForm.submitted),
      tap(g => this.status = "Unsaved Changes"),
      tap(g => this.dirty = true),
      debounceTime(5000),
      filter(f => !this.feedbackForm.submitted && !this.pending),
      tap(g => this.status = "Autosaving..."),
      switchMap(g =>
        this.api.submit(this.createSubmission(false)).pipe(
          catchError(err => {
            this.errors.push("Error while saving");
            this.status = "Error saving";
            return of(); // nothing inside prevents anything below from happening
          })
        )
      ),
      tap(r => {
        this.dirty = false;
      }),
      delay(1500),
      tap(r => {
        this.status = "Autosaved";
        this.errors = [];
      })
    );
    this.updated$.subscribe();

  }

  submit() {
    const submission = this.createSubmission(true);
    this.pending = true;
    this.api.submit(submission).subscribe(
      (feedback: any) => {
        this.feedbackForm = feedback;
        this.status = "";
      },
      (err: any) => {
        this.errors.push(err.error);
        this.pending = false;
      },
      () => {
        this.errors = [];
        this.pending = false;
        this.toggle();
      }
    );
  }

  createSubmission(finalSubmit: boolean) {
    let challengeId, challengeSpecId;
    if (this.type == "challenge") {
      challengeId = this.spec.instance?.id!;
      challengeSpecId = this.spec.id;
    }
    const submission: FeedbackSubmission = {
      challengeId: challengeId,
      challengeSpecId: challengeSpecId,
      gameId: this.game.id,
      questions: this.feedbackForm.questions,
      submit: finalSubmit
    };
    return submission;
  }

  toggle() {
    this.show = !this.show;
  }

}
