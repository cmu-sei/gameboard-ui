import { Component, ViewChild, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { firstValueFrom, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, delay, filter, first, tap } from 'rxjs/operators';
import { faCaretDown, faCaretRight, faCloudUploadAlt, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { BoardGame, BoardPlayer, BoardSpec } from '@/api/board-models';
import { FeedbackService } from '@/api/feedback.service';
import { Feedback, FeedbackSubmission, FeedbackQuestion } from '@/api/feedback-models';

export type MiniBoardSpec = {
  id: string,
  instance?: {
    id: string,
    state: { isActive: boolean }
  },
}

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss']
})
export class FeedbackFormComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() boardPlayer?: BoardPlayer;
  @Input() hideIfFeedbackProvidedPreviously = false;
  @Input() spec?: MiniBoardSpec;
  @Input() title!: string;
  @Input() type!: 'challenge' | 'game';
  @ViewChild(NgForm) form!: FormGroup;

  faSubmit = faCloudUploadAlt;
  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;
  faExclamationCircle = faExclamationCircle;

  feedbackForm: Feedback;
  templateMap: Map<string, FeedbackQuestion> = new Map<string, FeedbackQuestion>();

  errors: any[] = [];
  game?: BoardGame;
  isForceHidden = false;
  show = false;
  submitPending: boolean = false;

  refreshSpec$ = new Subject<BoardSpec>();
  status: string = "";

  characterLimit: number = 2000;

  private updated$!: Observable<any>;
  private autoUpdateSub?: Subscription;

  constructor(private api: FeedbackService) {
    this.feedbackForm = {
      questions: [],
      submitted: false
    };
  }

  ngAfterViewInit(): void {
    this.autosaveInit();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    await this.load(this.boardPlayer, this.spec, this.type);
    this.isForceHidden = (this.feedbackForm?.submitted || false) && this.hideIfFeedbackProvidedPreviously;
  }

  ngOnDestroy(): void {
    this.autoUpdateSub?.unsubscribe();
  }

  updateFeedback(feedback: Feedback) {
    this.feedbackForm.submitted = false;
    if (feedback && feedback.questions.length > 0) {
      // swap in the answers from user submitted response object, but only answers
      feedback.questions.forEach((question) => {
        // templateMap holds references to feedback form question objects, mapped by id
        const questionTemplate = this.templateMap.get(question.id);
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

  autosaveInit() {
    // respond to changes for autosave feature
    this.updated$ = this.form.valueChanges.pipe(
      filter(f => !!this.boardPlayer),
      filter(f => !this.form.pristine && !this.feedbackForm.submitted && !this.submitPending),
      tap(g => this.status = "Unsaved Changes"),
      debounceTime(7000),
      filter(f => !this.form.pristine && !this.feedbackForm.submitted && !this.submitPending),
      tap(g => this.status = "Autosaving..."),
      tap(g => this.submit(true)),
      catchError((err, caught) => {
        this.errors.push("Error while saving");
        this.status = "Error saving";
        return of(); // this prevents anything below from happening
      }),
      delay(1500),
      tap(r => {
        if (r) {
          this.status = "Autosaved";
          this.errors = [];
        }
      })
    );

    this.autoUpdateSub = this.updated$.subscribe();
  }

  submit(isAutoSave = false) {
    const submission = this.createSubmission(!isAutoSave);
    if (!submission) {
      throw new Error("Can't create a final submission without a player.");
    }

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

        if (!isAutoSave)
          this.toggleShow();
      }
    );
  }

  createSubmission(finalSubmit: boolean) {
    if (!this.boardPlayer) {
      return null;
    }

    let challengeId, challengeSpecId;
    if (this.type == "challenge") {
      challengeId = this.spec?.instance?.id;
      challengeSpecId = this.spec?.id;
    }
    const submission: FeedbackSubmission = {
      challengeId: challengeId,
      challengeSpecId: challengeSpecId,
      gameId: this.boardPlayer.gameId,
      questions: this.feedbackForm.questions,
      submit: finalSubmit
    };
    return submission;
  }

  toggleShow() {
    this.show = !this.show;
  }

  // Used to change the answer for a question as multiple choices are selected
  modifyMultipleAnswer(question: FeedbackQuestion, answerChunk: string, checkedEvent: any, isRadio: boolean = false) {
    // If the answer is undefined, set it to be an empty string
    if (!question.answer) question.answer = "";

    // If we're asking for specific information, we have to add on the info entered in the specific info box by looking up its ID
    let addition: string = "";
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

  options(min: number, max: number) {
    return Array.from(new Array(max), (x, i) => i + min);
  }

  private async load(boardPlayer?: BoardPlayer, spec?: MiniBoardSpec, type?: "challenge" | "game") {
    // clear form
    this.form?.reset();
    this.status = "";
    this.errors = [];

    if (!boardPlayer || !type)
      return;

    if (type == "challenge") {
      if (!spec) {
        throw new Error("Can't load challenge-level feedback without a spec.");
      }

      await this.loadChallenge(boardPlayer, spec);
      return;
    }

    await this.loadGame(boardPlayer);
  }

  private async loadChallenge(boardPlayer: BoardPlayer, spec: MiniBoardSpec) {
    this.setTemplate(boardPlayer.game.feedbackTemplate.challenge);

    if (!spec) {
      return;
    }

    try {
      const feedback = await firstValueFrom(
        this.api.retrieve({
          challengeSpecId: spec.id,
          challengeId: spec.instance?.id,
          gameId: boardPlayer.gameId
        })
      );

      if (feedback)
        this.updateFeedback(feedback);

      // behavior for whether to hide form on load based on challenge status or already submitted
      this.show = !this.spec?.instance?.state.isActive;

      if (feedback?.submitted) {
        this.show = false;
      }
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  private async loadGame(boardPlayer: BoardPlayer) {
    this.setTemplate(boardPlayer.game.feedbackTemplate.game);

    if (!boardPlayer) {
      return;
    }

    try {
      const feedback = await firstValueFrom(this.api.retrieve({ gameId: boardPlayer.gameId }));

      if (boardPlayer.session.isAfter)
        this.show = true;
      if (feedback?.submitted)
        this.show = false;
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }
}
