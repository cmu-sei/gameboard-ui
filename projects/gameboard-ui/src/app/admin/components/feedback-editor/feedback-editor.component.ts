import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, debounceTime, map, tap } from 'rxjs';
import { FeedbackTemplate } from '@/api/feedback-models';
import { YamlService } from '@/services/yaml.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { isObject } from '@/tools/functions';
import { YAMLParseError } from 'yaml';
import { FeedbackService } from '@/api/feedback.service';

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
  protected validationMessages: string[] = [];

  private templateChangeSubject$ = new BehaviorSubject<FeedbackTemplate | null>(null);

  public constructor(
    private feedbackService: FeedbackService,
    private unsub: UnsubscriberService,
    private yamlService: YamlService) {
    this.unsub.add(
      this.templateChangeSubject$
        .pipe(
          debounceTime(500),
          tap(t => this.templateChange.emit(t))
        )
        .subscribe()
    );
  }

  async ngOnInit() {
    this.sampleConfig = await this.feedbackService.getSampleYaml() || "";
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log("got", changes.feedbackTemplate.currentValue);
    if (!this.feedbackTemplate) {
      this.boundYaml = "";
      return;
    }

    this.boundYaml = this.yamlService.render(this.feedbackTemplate, " Keys are written in alphabetical order - your 'message' field might be at the bottom 👇🏻");
  }

  protected handlePasteSample(): void {
    if (this.sampleConfig) {
      this.boundYaml = this.sampleConfig;
      this.updateYaml(this.sampleConfig);
    }
  }

  protected updateYaml(yamlConfig: string) {
    const feedbackTemplate = this.validateInput(yamlConfig);
    this.update(feedbackTemplate);
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
    }

    return parsed;
  }
}
