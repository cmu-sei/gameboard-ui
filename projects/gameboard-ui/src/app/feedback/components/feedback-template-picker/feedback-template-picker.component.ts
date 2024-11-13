import { Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FeedbackTemplateView } from '@/feedback/feedback.models';
import { fa } from '@/services/font-awesome.service';
import { CoreModule } from "../../../core/core.module";
import { FeedbackService } from '@/api/feedback.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';

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
  ],
  templateUrl: './feedback-template-picker.component.html',
  styleUrls: ['./feedback-template-picker.component.scss']
})
export class FeedbackTemplatePickerComponent implements OnInit {
  @Input() challengeSpecFeedbackTemplate?: FeedbackTemplateView;
  @Output() challengeSpecFeedbackTemplateIdChange = new EventEmitter<string | undefined>();

  @Input() gameFeedbackTemplate?: FeedbackTemplateView;
  @Output() gameFeedbackTemplateChange = new EventEmitter<FeedbackTemplateView | undefined>();

  @ViewChild("createTemplate") createTemplate?: TemplateRef<any>;

  private feedbackService = inject(FeedbackService);
  private modalService = inject(ModalConfirmService);
  private toastsService = inject(ToastService);

  protected challengeTemplateId?: string;
  protected createEditTemplateForm = new FormGroup({
    id: new FormControl(""),
    helpText: new FormControl(""),
    name: new FormControl("", Validators.required),
    content: new FormControl("", [Validators.required, this.feedbackService.getTemplateQuestionsValidator()])
  });
  protected gameTemplateId?: string;
  protected templates: FeedbackTemplateView[] = [];
  protected editingTemplate?: FeedbackTemplateView;
  protected fa = fa;
  protected sampleConfig?: string;

  async ngOnInit(): Promise<void> {
    this.sampleConfig = await this.feedbackService.getTemplateSampleYaml() || "";
    await this.load();
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
    if (!this.createTemplate)
      throw new Error("Couldn't resolve create template.");

    this.modalService.openTemplate(this.createTemplate);
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
    this.modalService.openConfirm({
      bodyContent: `Are you sure you want to delete this feedback template? This can't be undone.`,
      onConfirm: async () => {
      },
      subtitle: template.name,
      title: "Delete Feedback Template?"
    });
  }

  protected handlePasteSample() {
    this.createEditTemplateForm.patchValue({ content: this.sampleConfig });
  }

  private async load() {
    const templatesResponse = await this.feedbackService.getTemplates();
    this.templates = templatesResponse.templates;
  }
}
