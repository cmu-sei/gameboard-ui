import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChallengesReportFlatParameters, ChallengesReportRecord, ChallengesReportStatSummary } from './challenges-report/challenges-report.models';
import { ReportResultsWithOverallStats } from '@/reports/reports-models';
import { ApiUrlService } from '@/services/api-url.service';

@Injectable({ providedIn: 'root' })
export class ChallengesReportService {

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient
  ) { }

  public getReportData(parameters: ChallengesReportFlatParameters): Observable<ReportResultsWithOverallStats<ChallengesReportStatSummary, ChallengesReportRecord>> {
    return this.http.get<ReportResultsWithOverallStats<ChallengesReportStatSummary, ChallengesReportRecord>>(this.apiUrl.build("reports/challenges", parameters));
  }
}
