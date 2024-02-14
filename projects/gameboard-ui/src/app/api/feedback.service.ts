// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { Feedback, FeedbackQuestion, FeedbackReportDetails, FeedbackSubmission, FeedbackTemplate } from './feedback-models';
import { YamlService } from '@/services/yaml.service';
import { hasProperty } from '@/tools/functions';
import { unique } from '../../tools';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  url = '';

  constructor(
    config: ConfigService,
    private http: HttpClient,
    private yamlService: YamlService
  ) {
    this.url = config.apphost + 'api';
  }

  public getRequiredProperties(): string[] {
    return ["id", "prompt", "type"];
  }

  public async getSampleYaml(): Promise<string | null> {
    return await this.yamlService.loadSample("feedback-config");
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
    const retVal = [];
    const requiredProperties: (keyof FeedbackQuestion)[] = ["id", "prompt", "type"];
    const uniqueIds = unique(set.map(q => q.id));

    if (uniqueIds.length !== set.length) {
      retVal.push(`Ensure the **id** property of all questions in the _${type}_ set are unique.`);
    }

    for (let i = 0; i < set.length; i++) {
      for (const p of requiredProperties) {
        if (!hasProperty(set[i], p))
          retVal.push(`${type} question ${i} is missing required property **${p}**.`);
      }
    }

    return retVal;
  }
}
