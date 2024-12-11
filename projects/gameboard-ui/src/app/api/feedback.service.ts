// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { Feedback, FeedbackQuestion, FeedbackReportDetails, FeedbackSubmissionOldAndGross, FeedbackTemplate, QuestionType } from './feedback-models';
import { YamlService } from '@/services/yaml.service';
import { hasProperty } from '@/../tools/functions';
import { unique } from '@/../tools/tools';
import { CreateFeedbackTemplate, FeedbackQuestionsConfig, FeedbackSubmissionUpsert, FeedbackSubmissionView, FeedbackTemplateView, GetFeedbackSubmissionRequest, ListFeedbackTemplatesResponse } from '@/feedback/feedback.models';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ApiUrlService } from '@/services/api-url.service';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private url = '';
  private yamlService = inject(YamlService);

  private _deleted$ = new Subject<string>();
  public deleted$ = this._deleted$.asObservable();

  constructor(
    config: ConfigService,
    private apiUrl: ApiUrlService,
    private http: HttpClient
  ) {
    this.url = config.apphost + 'api';
  }

  public buildQuestionsFromTemplateContent(content: string): FeedbackQuestionsConfig {
    return this.yamlService.parse<FeedbackQuestionsConfig>(content);
  }

  public async createTemplate(template: CreateFeedbackTemplate) {
    return await firstValueFrom(this.http.post<FeedbackTemplateView>(`${this.url}/feedback/template`, template));
  }

  public async deleteTemplate(template: FeedbackTemplateView) {
    await firstValueFrom(this.http.delete(`${this.url}/feedback/template/${template.id}`));
    this._deleted$.next(template.id);
  }

  public async getTemplate(templateId: string): Promise<FeedbackTemplateView> {
    return await firstValueFrom(this.http.get<FeedbackTemplateView>(`${this.url}/feedback/template/${templateId}`));
  }

  public async getTemplates(): Promise<FeedbackTemplateView[]> {
    const response = await firstValueFrom(this.http.get<ListFeedbackTemplatesResponse>(`${this.url}/feedback/template`));
    return response.templates;
  }

  public getTemplateQuestionsValidator(): ValidatorFn {
    return (formControl: AbstractControl<any, any>) => {
      const set = this.buildQuestionsFromTemplateContent(formControl.value);

      if (!formControl.value)
        return null;

      if (!Array.isArray(set.questions)) {
        return {
          questionValidation: {
            valid: false,
            errors: ["Your questions are in an invalid format. Try clicking the link below to learn more about the expected question format."]
          }
        };
      }

      if (!set?.questions?.length) {
        return {
          questionValidation: {
            valid: false,
            errors: ["Questions are a key part of the feedback process! Why not enter some now?"]
          }
        };
      }

      const retVal: string[] = [];
      const requiredProperties: (keyof FeedbackQuestion)[] = ["id", "prompt", "type"];
      const uniqueIds = unique(set.questions.map(q => q?.id));

      if (uniqueIds.length !== set.questions.length) {
        retVal.push(`Ensure the **id** property of all questions are unique.`);
      }

      for (let i = 0; i < set.questions.length; i++) {
        const displayIndex = i + 1;
        // the user-friendly 1-indexed question
        // ensure the question has a legal id
        if (!set.questions[i]?.id) {
          retVal.push(`Question ${displayIndex} can't have a blank or missing ID.`);
        }

        for (const p of requiredProperties) {
          if (!hasProperty(set.questions[i], p))
            retVal.push(`Question ${displayIndex} is missing required property **${p}**.`);
        }
      }

      if (retVal.length) {
        return {
          questionValidation: {
            valid: false,
            errors: retVal
          }
        };
      }

      return null;
    };
  }

  public async getSampleYaml(): Promise<string | null> {
    return await this.yamlService.loadSample("feedback-config");
  }

  public async getSubmission(request: GetFeedbackSubmissionRequest): Promise<FeedbackSubmissionView | null> {
    return await firstValueFrom(this.http.get<FeedbackSubmissionView | null>(this.apiUrl.build("feedback/submission", request)));
  }

  public async getTemplateSampleYaml(): Promise<string | null> {
    return await this.yamlService.loadSample("feedback-template-content");
  }

  public list(search: any): Observable<FeedbackReportDetails[]> {
    return this.http.get<FeedbackReportDetails[]>(`${this.url}/feedback/list`, { params: search });
  }

  public retrieve(search: any): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.url}/feedback`, { params: search });
  }

  public save(submission: FeedbackSubmissionUpsert): Promise<FeedbackSubmissionView> {
    return firstValueFrom(this.http.post<FeedbackSubmissionView>(`${this.url}/feedback`, submission));
  }

  public submit(model: FeedbackSubmissionOldAndGross): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.url}/feedback/submit`, model);
  }

  public validateConfig(config: FeedbackTemplate): string[] {
    const retVal: string[] = [];

    if (!config.game && !config.challenge) {
      retVal.push("Your feedback template needs at least one of the `game` or `challenge` properties");
    }

    if (config.game) {
      retVal.push(...this.validateFeedbackQuestionSet("Game", config.game));
    }

    if (config.challenge) {
      retVal.push(...this.validateFeedbackQuestionSet("Challenge", config.challenge));
    }

    return retVal;
  }

  private validateFeedbackQuestionSet(type: "Game" | "Challenge", set: FeedbackQuestion[]): string[] {
    if (!set?.length) {
      return [];
    }

    const retVal: string[] = [];
    const requiredProperties: (keyof FeedbackQuestion)[] = ["id", "prompt", "type"];
    const uniqueIds = unique(set.map(q => q?.id));

    if (uniqueIds.length !== set.length) {
      retVal.push(`Ensure the **id** property of all questions in the _${type}_ set are unique.`);
    }

    const questionTypes = Object.values(QuestionType);

    for (let i = 0; i < set.length; i++) {
      const displayIndex = i + 1;
      // the user-friendly 1-indexed question
      // ensure the question has a legal id
      if (!set[i]?.id) {
        retVal.push(`${type} question ${displayIndex} can't have a blank or missing ID.`);
      }

      for (const p of requiredProperties) {
        if (!hasProperty(set[i], p))
          retVal.push(`${type} question ${displayIndex} is missing required property **${p}**.`);

        if (p === "type" && !questionTypes.some(t => t === set[i].type)) {
          retVal.push(`Property **type** on question **${displayIndex}** must be one of (${questionTypes.join(", ")})`);
        }
      }
    }

    return retVal;
  }
}
