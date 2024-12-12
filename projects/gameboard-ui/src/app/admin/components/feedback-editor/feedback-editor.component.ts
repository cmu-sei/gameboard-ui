import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, debounceTime, tap } from 'rxjs';
import { FeedbackTemplate } from '@/api/feedback-models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
  selector: 'app-feedback-editor',
  templateUrl: './feedback-editor.component.html',
  styleUrls: ['./feedback-editor.component.scss'],
  providers: [UnsubscriberService]
})
export class FeedbackEditorComponent implements OnInit {
  @Input() feedbackConfig = "";
  @Output() templateChange = new EventEmitter<FeedbackTemplate | null>();

  protected boundYaml = "";
  protected sampleConfig?: string;
  protected validationMessages: string[] = [];

  private templateChangeSubject$ = new BehaviorSubject<FeedbackTemplate | null>(null);

  public constructor(
    private modalService: ModalConfirmService,
    private unsub: UnsubscriberService) {
    this.unsub.add(
      this.templateChangeSubject$
        .pipe(
          debounceTime(1000),
          tap(t => this.templateChange.emit(t))
        )
        .subscribe()
    );
  }

  async ngOnInit() {
    this.boundYaml = this.feedbackConfig;
  }

  protected handleAboutFeedbackClick() {
    this.modalService.openConfirm({
      bodyContent: `You can use this box to configure questions that will automatically be presented to players upon conclusion of a challenge or game. Enter valid YAML to set these up.

Each question requires these properties at minumum:

- **id:** A unique identifying string for the question.
- **prompt:** The question that players will answer (e.g. "If you could change one thing about this challenge, what would it be?")
- **type:** The type of the response you want to collect from players. Valid options are **likert**, **text**, **selectOne**, and **selectMany**.

Depending on the value of **type**, additional configuration may be required. For non-text questions, you'll also need:

- **min:** The minimum numeric value of the question's scale (e.g. 1 on a scale from 1-10)
- **minLabel:** The label for the lowest value of the question's scale (e.g. "Very Easy")
- **max:** The maximum numeric value of the question's scale (e.g. 10 on a scale from 10)
- **maxLabel:** The label for the lowest value of the question's scale (e.g. "Very Hard")`,
      hideCancel: true,
      renderBodyAsMarkdown: true,
      modalClasses: ["modal-xl"],
      title: "About feedback templates"
    });
  }
}
