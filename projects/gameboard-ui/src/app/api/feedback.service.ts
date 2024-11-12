// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { Feedback, FeedbackQuestion, FeedbackReportDetails, FeedbackSubmission, FeedbackTemplate, QuestionType } from './feedback-models';
import { YamlService } from '@/services/yaml.service';
import { hasProperty } from '@/../tools/functions';
import { unique } from '@/../tools/tools';
import { FeedbackTemplateView, GetFeedbackTemplatesResponse } from '@/feedback/feedback.models';

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

  private dummyTemplate = {
    id: "c1c81543-a7f8-4146-b647-2ad5f80cd821",
    content: `
- type: selectOne
  required: true
  min: 1
  max: 0
  options:
    - Cyber Defense Incident Responder
    - Cyber Defense Forensics Analyst
    - Network Operations Specialist
    - Cyber Defense Analyst
    - Exploitation Analyst
    - Cyber Operator
    - Research and Development Specialist
    - Vulnerability Assessment Analyst
    - Data Analyst
    - Threat/Warning Analyst
    - Other
  display: dropdown
  id: q1
  prompt: Which NICE Work Role best aligns with your position?
  shortName: nice
- type: selectOne
  required: true
  min: 1
  max: 0
  options:
    - High School Diploma/GED
    - Associate Degree
    - Bachelor's Degree
    - Master's Degree
    - PhD
    - Other
  specify:
    key: Other
    prompt: ""
  id: q2
  prompt: Please Indicate your highest level of education.
  shortName: education
- type: selectOne
  required: true
  min: 1
  max: 0
  options:
    - 1-5
    - 5-10
    - 15+
    - None (N/A)
  id: q3
  prompt: How many years of cybersecurity experience do you have?
  shortName: experience
- type: selectMany
  required: true
  min: 1
  max: 0
  options:
    - Promotional messages about the President’s Cup (emails, social media,
      presentation, etc.)
    - Word-of-Mouth (a supervisor, colleague or friend encouraged me to
      register)
    - Returning participant (enjoyed the event and wanted to participate in it
      again)
    - Professional development (a chance to grow my cybersecurity skills)
    - Other
  specify:
    key: Other
    prompt: ""
  id: q4
  prompt: What made you decide to participate?
  shortName: decide
- type: selectOne
  required: true
  min: 1
  max: 0
  options:
    - Yes
    - No
    - Unsure
  id: q5
  prompt: Will you participate again next year if your schedule permits?
  shortName: again
- type: text
  required: false
  min: 1
  max: 0
  id: q6
  prompt: How can we improve the next President’s Cup? Please provide any other
    feedback you would like to share.
  shortName: improve
    `.trim(),
    createdBy: { id: "5a6bfb3f-a2e3-4629-9014-acc4d3f22935", name: "Ben" },
    name: "My Cool Template",
    responseCount: 12
  };

  public async deleteTemplate(template: FeedbackTemplateView) {
    return await firstValueFrom(this.http.delete(`${this.url}/feedback/template/${template.id}`));
  }

  public getTemplates(): Promise<GetFeedbackTemplatesResponse> {
    return firstValueFrom(of({
      challengeTemplates: [],
      gameTemplates: [this.dummyTemplate]
    }));
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
