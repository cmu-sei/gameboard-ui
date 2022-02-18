// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { Feedback, FeedbackReportDetails, FeedbackSearchParams, FeedbackSubmission } from './feedback-models';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(search: any): Observable<FeedbackReportDetails[]> {
    return this.http.get<FeedbackReportDetails[]>(`${this.url}/feedback/list`, {params: search});
  }

  public retrieve(search: any): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.url}/feedback`, {params: search});
  }

  public submit(model: FeedbackSubmission): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.url}/feedback/submit`, model);
  }


}
