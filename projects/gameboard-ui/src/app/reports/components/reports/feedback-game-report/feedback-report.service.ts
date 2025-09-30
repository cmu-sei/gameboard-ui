// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { FeedbackGameReportParameters, FeedbackGameReportResponse } from './feedback-game-report.models';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';

@Injectable({ providedIn: 'root' })
export class FeedbackReportService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  get(parameters: FeedbackGameReportParameters) {
    return firstValueFrom(this.http.get<FeedbackGameReportResponse>(this.apiUrl.build("reports/feedback", parameters)));
  }
}
