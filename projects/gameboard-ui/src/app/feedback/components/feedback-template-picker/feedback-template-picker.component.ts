import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FeedbackTemplateView } from '@/feedback/feedback.models';
import { fa } from '@/services/font-awesome.service';
import { CoreModule } from "../../../core/core.module";
import { FeedbackService } from '@/api/feedback.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
  selector: 'app-feedback-template-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    CoreModule
  ],
  templateUrl: './feedback-template-picker.component.html',
  styleUrls: ['./feedback-template-picker.component.scss']
})
export class FeedbackTemplatePickerComponent implements OnInit {
  @Input() challengeSpecFeedbackTemplate?: FeedbackTemplateView;
  @Output() challengeSpecFeedbackTemplateIdChange = new EventEmitter<string | undefined>();

  @Input() gameFeedbackTemplate?: FeedbackTemplateView;
  @Output() gameFeedbackTemplateChange = new EventEmitter<FeedbackTemplateView | undefined>();

  private feedbackService = inject(FeedbackService);
  private modalService = inject(ModalConfirmService);

  protected challengeTemplateId?: string;
  protected gameTemplateId?: string;
  protected challengeTemplates: FeedbackTemplateView[] = [];
  protected gameTemplates: FeedbackTemplateView[] = [];
  protected editingTemplate?: FeedbackTemplateView;
  protected fa = fa;

  async ngOnInit(): Promise<void> {
    const templatesResponse = await this.feedbackService.getTemplates();
    this.challengeTemplates = templatesResponse.challengeTemplates;
    this.gameTemplates = templatesResponse.gameTemplates;
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
}
