import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FeedbackTemplateView } from '@/feedback/feedback.models';
import { fa } from '@/services/font-awesome.service';
import { CoreModule } from "../../../core/core.module";
import { FeedbackService } from '@/api/feedback.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';
import { FeedbackSubmissionFormComponent } from "../feedback-submission-form/feedback-submission-form.component";
import { UnsubscriberService } from '@/services/unsubscriber.service';

interface UpsertFeedbackTemplateForm {
  id: string | null | undefined;
  helpText: string | null | undefined;
  name: string | null | undefined;
  content: string | null | undefined;
}

@Component({
  selector: 'app-feedback-template-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CoreModule,
    FeedbackSubmissionFormComponent
  ],
  templateUrl: './feedback-template-picker.component.html',
  styleUrls: ['./feedback-template-picker.component.scss']
})
export class FeedbackTemplatePickerComponent implements OnInit {
  @Input() labelText?: string;
  @Input() templateId?: string;
  @Output() templateIdChange = new EventEmitter<string | undefined>();
  @Output() select = new EventEmitter<FeedbackTemplateView>();

  @ViewChild("createEditModalTemplate") createEditModalTemplate?: TemplateRef<any>;
  @ViewChild("previewTemplate") previewModalTemplate?: TemplateRef<any>;

  private feedbackService = inject(FeedbackService);
  private modalService = inject(ModalConfirmService);
  private toastsService = inject(ToastService);
  private unsub = inject(UnsubscriberService);

  protected createEditTemplateForm = new FormGroup({
    id: new FormControl(""),
    helpText: new FormControl(""),
    name: new FormControl("", Validators.required),
    content: new FormControl("", [Validators.required, this.feedbackService.getTemplateQuestionsValidator()])
  });

  protected selectedTemplate?: FeedbackTemplateView;
  protected templates: FeedbackTemplateView[] = [];
  protected fa = fa;
  protected sampleConfig?: string;

  async ngOnInit(): Promise<void> {
    this.sampleConfig = await this.feedbackService.getTemplateSampleYaml() || "";
    await this.load();

    this.unsub.add(
      this.feedbackService.deleted$.subscribe(async () => await this.load())
    );
  }

  protected handleCopyFromTemplate(templateId: string) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error("Couldn't resolve copy template.");
    }

    this.createEditTemplateForm.patchValue({
      content: template.content,
      helpText: template.helpText
    });
  }

  protected handleCreate() {
    if (!this.createEditModalTemplate)
      throw new Error("Couldn't resolve create template.");

    this.createEditTemplateForm.setValue({
      id: "",
      name: "",
      helpText: "",
      content: ""
    });

    this.modalService.openTemplate(this.createEditModalTemplate);
  }

  protected handleEdit(template: FeedbackTemplateView) {
    if (!this.createEditModalTemplate) {
      throw new Error("Couldn't resolve edit template");
    }

    this.createEditTemplateForm.setValue({
      id: template.id,
      name: template.name,
      helpText: template.helpText || "",
      content: template.content
    });

    this.modalService.openTemplate(this.createEditModalTemplate);
  }

  protected async handleCreateEditSubmit(model: Partial<UpsertFeedbackTemplateForm>) {
    const isEdit = !!model.id;

    if (!isEdit) {
      await this.feedbackService.createTemplate({
        content: model.content!,
        helpText: model.helpText || undefined,
        name: model.name!
      });
    }

    this.toastsService.showMessage(`Your new feedback template **${model.name}** has been created. You can select it for this game or its challenges now.`);
  }

  protected handleDelete(template: FeedbackTemplateView) {
    const responsesWarning = template.responseCount == 0 ? "" : `\n\n**NOTE:** This template has **${template.responseCount}** responses recorded. If you delete it, you'll also delete these responses.`;

    this.modalService.openConfirm({
      bodyContent: "Are you sure you want to delete this feedback template? This can't be undone." + responsesWarning,
      onConfirm: async () => {
        await this.feedbackService.deleteTemplate(template);
      },
      renderBodyAsMarkdown: true,
      subtitle: template.name,
      title: "Delete Feedback Template?"
    });
  }

  protected handlePasteSample() {
    this.createEditTemplateForm.patchValue({ content: this.sampleConfig }, { emitEvent: true });
  }

  protected handlePreview() {
    if (!this.previewModalTemplate) {
      throw new Error("Couldn't resolve preview template.");
    }

    this.modalService.openTemplate(this.previewModalTemplate);
  }

  protected handleTemplateSelect() {
    this.templateIdChange.emit(this.selectedTemplate?.id);
    this.select.emit(this.selectedTemplate);
  }

  private async load() {
    this.templates = await this.feedbackService.getTemplates();

    if (this.templates.length && this.templateId) {
      this.selectedTemplate = this.templates.find(t => t.id === this.templateId);
    }
    else {
      this.selectedTemplate = undefined;
      this.templateId = undefined;
    }
  }
}
