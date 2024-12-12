import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, NgForm } from '@angular/forms';
import { DateTime } from 'luxon';
import { catchError, debounceTime, delay, filter, Observable, of, Subscription, tap } from 'rxjs';
import { fa } from '@/services/font-awesome.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { FeedbackSubmissionAttachedEntity, FeedbackSubmissionView, FeedbackTemplateView } from '@/feedback/feedback.models';
import { FeedbackService } from '@/api/feedback.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { CoreModule } from '@/core/core.module';
import { FeedbackQuestion } from '@/api/feedback-models';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';

@Component({
  selector: 'app-feedback-submission-form',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    FontAwesomeModule,

    // components
    ErrorDivComponent,
    SpinnerComponent
  ],
  templateUrl: './feedback-submission-form.component.html',
  styleUrls: ['./feedback-submission-form.component.scss']
})
export class FeedbackSubmissionFormComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() feedbackEntity?: FeedbackSubmissionAttachedEntity;
  @Input() templateId?: string;
  @Input() isAdminView = false;
  @Input() isPreview = false;
  @ViewChild(NgForm) form!: FormGroup;

  private feedbackService = inject(FeedbackService);
  private localUser = inject(LocalUserService);

  protected characterLimit = 2000;
  protected errors: any[] = [];
  protected fa = fa;
  protected feedbackForm = { submitted: false };
  protected isLoading = false;
  protected status = "";
  protected submitPending = false;
  protected submission: FeedbackSubmissionView = {
    id: "",
    attachedEntity: { id: this.feedbackEntity?.id || "", entityType: this.feedbackEntity?.entityType || "challengeSpec" },
    feedbackTemplate: { id: this.templateId || "", name: "" },
    whenCreated: DateTime.now(),
    responses: [],
    user: {
      id: this.localUser.user$.value?.id || "",
      name: this.localUser.user$.value?.approvedName || ""
    }
  };
  protected template?: FeedbackTemplateView;

  private autoUpdateSub?: Subscription;
  private templateMap: Map<string, FeedbackQuestion> = new Map<string, FeedbackQuestion>();

  async ngOnInit() {
    await this.load();
    this.autosaveInit();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.autoUpdateSub?.unsubscribe();
  }

  async submit(isAutoSave = false) {
    if (this.isAdminView) {
      return;
    }

    if (!this.feedbackEntity) {
      throw new Error("Feedback entity is required");
    }

    if (!this.templateId) {
      throw new Error("Template Id is required");
    }

    this.errors = [];
    this.submitPending = true;

    try {
      const updatedSubmission = await this.feedbackService.save({
        attachedEntity: this.feedbackEntity,
        feedbackTemplateId: this.templateId,
        isFinalized: !isAutoSave,
        responses: this.submission.responses,
      });

      this.bindSubmission(updatedSubmission);
    }
    catch (err: any) {
      this.status = "Error: " + err;
      this.errors.push(err);
    }

    this.submitPending = false;
  }

  // Used to change the answer for a question as multiple choices are selected
  protected modifyMultipleAnswer(question: FeedbackQuestion, answerChunk: string, checkedEvent: any, isRadio: boolean = false) {
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
  protected modifySpecifiedAnswer(question: FeedbackQuestion, answerChunk: string, textChangedEvent: any) {
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

  protected options(min: number, max: number) {
    return Array.from(new Array(max), (x, i) => i + min);
  }

  private autosaveInit() {
    // respond to changes for autosave feature
    this.autoUpdateSub = this.form.valueChanges.pipe(
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
    ).subscribe();
  }

  // submissions aren't saved with the question type, so we have to merge their data in with the submission we create
  // on component launch that we build from the template
  private bindSubmission(submission: FeedbackSubmissionView | null) {
    if (!submission) {
      return;
    }

    const updatedLocalSubmission = {
      ...this.submission,
      whenCreated: submission.whenCreated,
      whenEdited: submission.whenEdited,
      whenFinalized: submission.whenFinalized
    };

    for (const question of updatedLocalSubmission.responses) {
      const boundAnswer = submission.responses.find(r => r.id === question.id);
      if (boundAnswer) {
        question.answer = boundAnswer.answer;
      }
    }

    this.submission = updatedLocalSubmission;
  }

  private async load() {
    if (!this.localUser.user$.value) {
      return;
    }

    this.errors = [];
    if (!this.templateId) {
      throw new Error("TemplateId is required");
    }

    this.template = await this.feedbackService.getTemplate(this.templateId);
    try {
      // map question id to reference of template object used in UI as form
      this.templateMap.clear();
      const questionsConfig = this.feedbackService.buildQuestionsFromTemplateContent(this.template.content);
      questionsConfig.questions.forEach(q => this.templateMap.set(q.id, q));
      this.submission.responses = questionsConfig.questions;

      // check if we've submitted before and whether or not we finalized
      if (!this.isPreview && this.feedbackEntity) {
        const existingSubmission = await this.feedbackService.getSubmission({ userId: this.localUser.user$.value.id, entityId: this.feedbackEntity.id, entityType: this.feedbackEntity.entityType });
        this.bindSubmission(existingSubmission);
      }
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }
}
