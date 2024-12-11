import { inject, Injectable } from '@angular/core';
import { ReportResults, ReportResultsWithOverallStats } from '@/reports/reports-models';
import { FeedbackReportParameters, FeedbackReportRecord, FeedbackReportStatSummary } from './feedback-report.models';
import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FeedbackReportService {
  private apiUrl = inject(ApiUrlService);
  private http = inject(HttpClient);

  async getReportData(parameters: FeedbackReportParameters): Promise<ReportResultsWithOverallStats<FeedbackReportStatSummary, FeedbackReportRecord>> {
    return await firstValueFrom(this.http.get<ReportResultsWithOverallStats<FeedbackReportStatSummary, FeedbackReportRecord>>(this.apiUrl.build("reports/feedback", parameters)));
  }
}
