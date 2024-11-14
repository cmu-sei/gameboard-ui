// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { Feedback, FeedbackQuestion, FeedbackReportDetails, FeedbackSubmission, FeedbackTemplate, QuestionType } from './feedback-models';
import { YamlService } from '@/services/yaml.service';
import { hasProperty } from '@/../tools/functions';
import { unique } from '@/../tools/tools';
import { CreateFeedbackTemplate, FeedbackTemplateView, ListFeedbackTemplatesResponse } from '@/feedback/feedback.models';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private url = '';
  private yamlService = inject(YamlService);

  constructor(
    config: ConfigService,
    private http: HttpClient
  ) {
    this.url = config.apphost + 'api';
  }

  public async createTemplate(template: CreateFeedbackTemplate) {
    return await firstValueFrom(this.http.post<FeedbackTemplateView>(`${this.url}/feedback/template`, template));
  }

  public async deleteTemplate(template: FeedbackTemplateView) {
    return await firstValueFrom(this.http.delete(`${this.url}/feedback/template/${template.id}`));
  }

  public async getTemplates(): Promise<ListFeedbackTemplatesResponse> {
    return await firstValueFrom(this.http.get<ListFeedbackTemplatesResponse>(`${this.url}/feedback/template`));
  }

  public getRequiredProperties(): string[] {
    return ["id", "prompt", "type"];
  }

  public getTemplateQuestionsValidator(): ValidatorFn {
    return (formControl: AbstractControl<any, any>) => {
      const set = this.yamlService.parse<FeedbackQuestion[]>(formControl.value);

      if (!formControl.value)
        return null;

      if (!Array.isArray(set)) {
        return {
          questionValidation: {
            valid: false,
            errors: ["Your questions are in an invalid format. Try clicking the link below to learn more about the expected question format."]
          }
        };
      }

      if (!set?.length) {
        return {
          questionValidation: {
            valid: false,
            errors: ["Questions are a key part of the feedback process! Why not enter some now?"]
          }
        };
      }

      const retVal: string[] = [];
      const requiredProperties: (keyof FeedbackQuestion)[] = ["id", "prompt", "type"];
      const uniqueIds = unique(set.map(q => q?.id));

      if (uniqueIds.length !== set.length) {
        retVal.push(`Ensure the **id** property of all questions are unique.`);
      }

      for (let i = 0; i < set.length; i++) {
        const displayIndex = i + 1;
        // the user-friendly 1-indexed question
        // ensure the question has a legal id
        if (!set[i]?.id) {
          retVal.push(`Question ${displayIndex} can't have a blank or missing ID.`);
        }

        for (const p of requiredProperties) {
          if (!hasProperty(set[i], p))
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

  public async getTemplateSampleYaml(): Promise<string | null> {
    return await this.yamlService.loadSample("feedback-template-content");
  }

  public list(search: any): Observable<FeedbackReportDetails[]> {
    return this.http.get<FeedbackReportDetails[]>(`${this.url}/feedback/list`, { params: search });
  }

  public retrieve(search: any): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.url}/feedback`, { params: search });
  }

  public submit(model: FeedbackSubmission): Observable<Feedback> {
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
