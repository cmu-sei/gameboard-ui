import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { FeedbackTemplate } from '@/api/feedback-models';
import { YamlService } from '@/services/yaml.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { isObject } from '@/tools/functions';
import { YAMLParseError } from 'yaml';

@Component({
  selector: 'app-feedback-editor',
  templateUrl: './feedback-editor.component.html',
  styleUrls: ['./feedback-editor.component.scss'],
  providers: [UnsubscriberService]
})
export class FeedbackEditorComponent implements OnChanges, OnInit {
  @Input() feedbackTemplate?: FeedbackTemplate;
  @Output() templateChange = new EventEmitter<FeedbackTemplate | null>();

  protected boundYaml = "";
  protected isValid = false;
  protected sampleConfig?: string;
  protected validationMessage = "";

  private templateChangeSubject$ = new BehaviorSubject<FeedbackTemplate | null>(null);

  public constructor(
    private unsub: UnsubscriberService,
    private yamlService: YamlService) {
    this.unsub.add(
      this.templateChangeSubject$
        .pipe(debounceTime(500))
        .subscribe(t => this.templateChange.emit(t)));
  }

  async ngOnInit() {
    this.sampleConfig = await this.yamlService.loadSample("feedback-config") || "";
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.feedbackTemplate) {
      this.boundYaml = "";
      return;
    }

    this.boundYaml = this.yamlService.render(this.feedbackTemplate);
  }

  // updateFeedbackMessage() {
  //   this.feedbackWarning = false;
  //   if (!this.feedbackConfig || this.feedbackConfig.trim().length == 0) {
  //     this.feedbackMessage = "No questions configured";
  //   } else if (this.feedbackTemplate) {
  //     if (!this.checkFeedbackIds()) {
  //       this.feedbackMessage = "IDs not unique in each list";
  //       this.feedbackWarning = true;
  //     } else {
  //       this.feedbackMessage = `${this.feedbackTemplate?.game?.length ?? 0} game, ${this.feedbackTemplate?.challenge?.length ?? 0} challenge questions configured`;
  //     }
  //   } else {
  //     this.feedbackMessage = "Invalid YAML format";
  //     this.feedbackWarning = true;
  //   }
  // }

  // checkFeedbackIds(): boolean {
  //   if (!this.feedbackTemplate)
  //     return true;

  //   const boardIds = new Set(this.feedbackTemplate.game?.map(q => q.id));
  //   const challengeIds = new Set(this.feedbackTemplate.challenge?.map(q => q.id));
  //   if ([...boardIds].length != (this.feedbackTemplate.game?.length ?? 0) || [...challengeIds].length != (this.feedbackTemplate.challenge?.length ?? 0)) {
  //     return false;
  //   }
  //   return true;
  // }

  protected handlePasteSample(): void {
    if (this.sampleConfig)
      this.boundYaml = this.sampleConfig;
  }

  protected updateYaml(yamlConfig: string) {
    let template: FeedbackTemplate | undefined = undefined;
    const feedbackTemplate = this.validateInput(yamlConfig);

    this.update(template);
  }

  private update(template?: FeedbackTemplate) {
    this.feedbackTemplate = template;

    this.templateChangeSubject$.next(template || null);
    this.templateChange.emit(template);
  }

  private validateInput(input: string): FeedbackTemplate | undefined {
    this.validationMessage = "";
    let parsed: FeedbackTemplate | undefined = undefined;
    const invalidYaml = "This isn't a valid YAML document. Try pasting the example configuration to get started.";

    if (!input)
      return parsed;

    try {
      parsed = this.yamlService.parse<FeedbackTemplate>(input);

      if (!isObject(parsed)) {
        this.validationMessage = invalidYaml;
        return undefined;
      }
    }
    catch (err) {
      if (err instanceof YAMLParseError) {
        this.validationMessage = invalidYaml;
        return undefined;
      }
    }

    if (!parsed?.challenge || !parsed?.game) {
      this.validationMessage = "Your feedback configuration must include questions for either the game or challenge properties.";
      return undefined;
    }

    for (const gameQuestion of parsed?.game || []) {
      const keys = Object.keys(gameQuestion);
      const hasRequiredProperties = ["id", "prompt", "shortName", "type"].every(p => !!keys.find(k => k === p));

      if (!hasRequiredProperties) {
        this.validationMessage = "Each configured question must have the following properties: id, prompt, shortName, and type";
      }
    }

    return parsed;
  }
}
