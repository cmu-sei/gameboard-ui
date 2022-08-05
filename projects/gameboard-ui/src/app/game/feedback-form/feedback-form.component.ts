import { Component, OnInit, ViewChild, Input, AfterViewInit } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { BoardSpec, Challenge, ChallengeView, GameState } from '../../api/board-models';
import { faCaretDown, faCaretRight, faCloudUploadAlt, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
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
  @Input() game!: Game | BoardGame; // these share: id, name, feedbacktemplate
  @Input() type!: string;
  @ViewChild(NgForm) form!: FormGroup;

  faSubmit = faCloudUploadAlt;
  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;
  faExclamationCircle = faExclamationCircle;

  feedbackForm: Feedback;
  templateMap: Map<string, FeedbackQuestion> = new Map<string, FeedbackQuestion>();

  errors: any[] = [];
  submitPending: boolean = false;
  show: boolean = false;

  refreshSpec$ = new Subject<BoardSpec>();
  updated$!: Observable<any>;
  status: string = "";

  characterLimit: number = 2000;

  constructor(
    private api: FeedbackService
  ) {
    this.feedbackForm = {
      questions: [],
      submitted: false
    };
   }

  ngOnInit(): void {
    if (this.type == "game") {
      this.setTemplate(this.game.feedbackTemplate.game);
    } else if (this.type == "challenge") {
      // set template only once since all challenges of a game have same template
      this.setTemplate(this.game.feedbackTemplate.challenge);
    }
  }

  gameAfterViewInit() {
    this.api.retrieve({gameId: this.game.id}).subscribe(
      feedback => {
        this.updateFeedback(feedback);
        if (this.session.isAfter)
          this.show = true;
        if (feedback?.submitted)
          this.show = false;
      },
      (err: any) => {}
    )
  }

  challengeAfterViewInit() {
    // start listening for challenge spec to change -> swap out feedback per spec
    const fetch$ = merge(
      this.specs$,
      this.refreshSpec$
    ).pipe(
      tap(spec => this.spec = spec),
      tap(s => {
        // reset form to clear answers and set to pristine
        this.form.reset();
        this.status = "";
        this.errors = [];
      }),
      // try fetch saved or submitted feedback, or return null if none exists
      switchMap(spec => this.api.retrieve({
        challengeSpecId: spec.id,
        challengeId: spec.instance?.id,
        gameId: this.game.id
      })),
    ).subscribe(feedback => {
      this.updateFeedback(feedback)
      // behavior for whether to hide form on load based on challenge status or already submitted
      if (!this.spec.instance?.state.isActive) {
        this.show = true;
      } else {
        this.show = false;
      }
      if (feedback?.submitted) {
        this.show = false;
      }
    });
    // use input spec to initially trigger above loading for first spec
    this.refreshSpec$.next(this.spec);
  }

  updateFeedback(feedback: Feedback) {
    this.feedbackForm.submitted = false;
    if (feedback && feedback.questions.length > 0) {
      // swap in the answers from user submitted response object, but only answers
      feedback.questions.forEach((question) => {
        // templateMap holds references to feedback form question objects, mapped by id
        let questionTemplate = this.templateMap.get(question.id);
        if (questionTemplate)
          questionTemplate.answer = question.answer;
      });
      this.feedbackForm.submitted = feedback.submitted;
    }
  }

  setTemplate(template: FeedbackQuestion[]) {
    this.feedbackForm.questions = template;
    this.templateMap.clear();
    // map question id to reference of template object used in UI as form
    template?.forEach(q => this.templateMap.set(q.id, q));
  }

  ngAfterViewInit(): void {
    if (this.type == "game") {
      this.gameAfterViewInit();
    } else if (this.type == "challenge") {
      this.challengeAfterViewInit();
    }
    this.autosaveInit();
  }

  autosaveInit() {
    // respond to changes for autosave feature
    this.updated$ = this.form.valueChanges.pipe(
      filter(f => !this.form.pristine && !this.feedbackForm.submitted && !this.submitPending),
      tap(g => this.status = "Unsaved Changes"),
      debounceTime(7000),
      filter(f => !this.form.pristine && !this.feedbackForm.submitted && !this.submitPending),
      tap(g => this.status = "Autosaving..."),
      switchMap(g =>
        this.api.submit(this.createSubmission(false)).pipe(
          catchError(err => {
            this.errors.push("Error while saving");
            this.status = "Error saving";
            return of(); // this prevents anything below from happening
          })
        )
      ),
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
    this.submitPending = true;
    this.api.submit(submission).subscribe(
      (feedback: Feedback) => {
        this.updateFeedback(feedback);
        this.status = "";
      },
      (err: any) => {
        this.errors.push(err.error);
        this.submitPending = false;
      },
      () => {
        this.errors = [];
        this.submitPending = false;
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

  options(min: number, max: number) {
    return Array.from(new Array(max), (x, i) => i + min);
  }

  // Used to change the answer for a question as multiple choices are selected
  modifyMultipleAnswer(question: FeedbackQuestion, answerChunk: string, checkedEvent: any, isRadio: boolean = false) {
    // If the answer is undefined, set it to be an empty string
    if (!question.answer) question.answer = "";

    // If we're asking for specific information, we have to add on the info entered in the specific info box by looking up its ID
    let addition: string = ""
    if (question.specify && question.specify.key == answerChunk) addition = " (" + (<HTMLInputElement>document.getElementById(`input-${question.id}-${answerChunk}`)).value + ")";

    // If this is a radio button, we can just set the answer
    if (isRadio) {
      question.answer = answerChunk + addition;
    }
    else {
      // Otherwise, combine it with other answers or remove it from the string
      if (checkedEvent.target.checked) question.answer += "," + answerChunk + addition;
      else question.answer = `,${question.answer}`.split(`,${answerChunk + addition}`).join("");

      // If we lead with a comma, remove the comma
      if (question.answer?.charAt(0) == ",") question.answer = question.answer?.substring(1, question.answer?.length);
    }
  }

  // Used to change an answer when the user should enter specific information (like "Other")
  modifySpecifiedAnswer(question: FeedbackQuestion, answerChunk: string, textChangedEvent: any) {
    // If the text box is checked and this question has specific info, we can retrieve the box's info and add that onto the answer
    if ((<HTMLInputElement>document.getElementById(`check-${question.id}-${answerChunk}`)).checked) {
      if (question.specify && question.specify.key == answerChunk && question.answer) {
        // Split the string by the option given and whatever characters come after its first parentheses and right before its end parentheses
        question.answer = question.answer.split(new RegExp(`,?${answerChunk} \\(.*?\\),?`)).join("");
        // Then add this new answer onto the end
        question.answer += `,${answerChunk} (${textChangedEvent.target.value})`;
      }
    }

    // If we lead with a comma, remove the comma
    if (question.answer?.charAt(0) == ",") question.answer = question.answer?.substring(1, question.answer?.length);
  }
}
