import { Injectable } from '@angular/core';
import { FeedbackGameReportParameters, FeedbackGameReportResponse } from './feedback-game-report.models';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';

@Injectable({ providedIn: 'root' })
export class FeedbackGameReportService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  get(parameters: FeedbackGameReportParameters) {
    return firstValueFrom(this.http.get<FeedbackGameReportResponse>(this.apiUrl.build("reports/feedback-games", parameters)));
  }
}
