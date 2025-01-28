import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChallengesReportFlatParameters, ChallengesReportRecord, ChallengesReportStatSummary } from './challenges-report/challenges-report.models';
import { ReportResultsWithOverallStats } from '@/reports/reports-models';
import { ApiUrlService } from '@/services/api-url.service';
import { FilesService } from '@/services/files.service';

@Injectable({ providedIn: 'root' })
export class ChallengesReportService {

  constructor(
    private apiUrl: ApiUrlService,
    private filesService: FilesService,
    private http: HttpClient
  ) { }

  public getReportData(parameters: ChallengesReportFlatParameters): Observable<ReportResultsWithOverallStats<ChallengesReportStatSummary, ChallengesReportRecord>> {
    return this.http.get<ReportResultsWithOverallStats<ChallengesReportStatSummary, ChallengesReportRecord>>(this.apiUrl.build("reports/challenges", parameters));
  }

  getSubmissionsCsv(parameters: ChallengesReportFlatParameters, challengeSpecId?: string): Promise<void> {
    const fileName = !!challengeSpecId ? `${challengeSpecId}-submissions` : "submissions";
    return this.filesService.downloadFileFrom(this.apiUrl.build(`reports/export/challenges/submissions/${challengeSpecId || ""}`, parameters), fileName, "csv", "text/csv");
  }
}
