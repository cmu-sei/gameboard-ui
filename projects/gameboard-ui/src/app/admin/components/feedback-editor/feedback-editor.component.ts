import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, debounceTime, tap } from 'rxjs';
import { FeedbackTemplate } from '@/api/feedback-models';
import { YamlService } from '@/services/yaml.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { isObject } from '@/../tools/functions';
import { YAMLParseError } from 'yaml';
import { FeedbackService } from '@/api/feedback.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
  selector: 'app-feedback-editor',
  templateUrl: './feedback-editor.component.html',
  styleUrls: ['./feedback-editor.component.scss'],
  providers: [UnsubscriberService]
})
export class FeedbackEditorComponent implements OnInit {
  @Input() feedbackTemplate?: FeedbackTemplate;
  @Output() templateChange = new EventEmitter<FeedbackTemplate | null>();

  protected boundYaml = "";
  protected sampleConfig?: string;
  protected validationMessages: string[] = [];

  private templateChangeSubject$ = new BehaviorSubject<FeedbackTemplate | null>(null);

  public constructor(
    private feedbackService: FeedbackService,
    private modalService: ModalConfirmService,
    private unsub: UnsubscriberService,
    private yamlService: YamlService) {
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
    this.sampleConfig = await this.feedbackService.getSampleYaml() || "";

    if (!this.feedbackTemplate) {
      this.updateYaml("");
      return;
    }

    this.updateYaml(this.yamlService.render(this.feedbackTemplate || ""));
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

  protected handlePasteSample(): void {
    if (this.sampleConfig && this.boundYaml) {
      this.modalService.openConfirm({
        title: "Paste a sample feedback configuration",
        bodyContent: `Are you sure you want to replace your current feedback configuration (**${this.feedbackTemplate?.game?.length || 0}** game questions and **${this.feedbackTemplate?.challenge?.length}** challenge questions)?`,
        renderBodyAsMarkdown: true,
        onConfirm: () => this.updateYaml(this.sampleConfig || "")
      });

      return;
    }

    if (this.sampleConfig) {
      this.updateYaml(this.sampleConfig);
    }
  }

  protected updateYaml(yamlConfig: string) {
    // if blank, delete the configuration
    if (!yamlConfig) {
      this.update(undefined);
      return;
    }

    // otherwise, only send updates when the config is valid
    this.boundYaml = yamlConfig;
    const feedbackTemplate = this.validateInput(yamlConfig);

    if (feedbackTemplate && !this.validationMessages.length) {
      try {
        this.update(feedbackTemplate);
      }
      catch (err: any) {
        this.validationMessages.push(err);
      }
    }
  }

  private update(template?: FeedbackTemplate) {
    this.feedbackTemplate = template;
    this.templateChangeSubject$.next(template || null);
  }

  private validateInput(input: string): FeedbackTemplate | undefined {
    this.validationMessages = [];

    let parsed: FeedbackTemplate | undefined = undefined;
    const invalidYaml = "This isn't a valid YAML document. Try pasting the example configuration to get started.";

    if (!input)
      return parsed;

    try {
      parsed = this.yamlService.parse<FeedbackTemplate>(input);

      if (!isObject(parsed)) {
        this.validationMessages.push(invalidYaml);
        return undefined;
      }
    }
    catch (err) {
      if (err instanceof YAMLParseError) {
        this.validationMessages.push(invalidYaml);
        return undefined;
      }
    }

    if (parsed) {
      this.validationMessages = this.validationMessages.concat(this.feedbackService.validateConfig(parsed));

      // don't bother converting IDs if we're not going to pass validation
      if (!this.validationMessages.length) {
        // workaround for a funky thing: if the value supplied for a question's "Id" property can be evaluated
        // as an integer, then the yaml library parses it as an integer, even if the typescript type is different
        // (e.g. string). This just forces all IDs to be strings, which is the correct type.
        if (parsed?.game)
          for (const gameQuestion of parsed.game) {
            gameQuestion.id = gameQuestion?.id?.toString() || gameQuestion.id;
          }

        if (parsed?.challenge) {
          for (const challengeQuestion of parsed.challenge) {
            challengeQuestion.id = challengeQuestion?.id?.toString() || challengeQuestion.id;
          }
        }
      }
    }

    return parsed;
  }
}
