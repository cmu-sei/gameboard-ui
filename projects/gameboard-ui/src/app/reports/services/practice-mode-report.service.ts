import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PracticeModeReportFlatParameters, PracticeModeReportParameters, PracticeModeReportByUserRecord, PracticeModeReportByChallengeRecord, PracticeModeReportRecord, PracticeModeReportGrouping, PracticeModeReportByPlayerModePerformanceRecord, PracticeModeReportPlayerModeSummary, PracticeModeReportOverallStats } from '../components/reports/practice-mode-report/practice-mode-report.models';
import { Observable, map } from 'rxjs';
import { ReportResultsWithOverallStats } from '../reports-models';
import { ReportsService } from '../reports.service';
import { SimpleEntity } from '@/api/models';
import { LogService } from '@/services/log.service';

@Injectable({ providedIn: 'root' })
export class PracticeModeReportService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private log: LogService,
    private reportsService: ReportsService,
  ) { }

  getByChallengeData(parameters: PracticeModeReportFlatParameters): Observable<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByChallengeRecord>> {
    parameters.grouping = PracticeModeReportGrouping.challenge;
    this.reportsService.applyDefaultPaging(parameters);

    return this.http.get<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByChallengeRecord>>(this.apiUrl.build("reports/practice-mode", parameters));
  }

  getByPlayerModePerformance(parameters: PracticeModeReportFlatParameters): Observable<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByPlayerModePerformanceRecord>> {
    parameters.grouping = PracticeModeReportGrouping.playerModePerformance;
    this.reportsService.applyDefaultPaging(parameters);

    return this.http.get<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByPlayerModePerformanceRecord>>(this.apiUrl.build("reports/practice-mode", parameters)).pipe(
      map(r => {
        r.records = r.records.map(record => {
          if (record.practiceStats?.lastAttemptDate) {
            record.practiceStats.lastAttemptDate = this.reportsService.queryStringEncodedDateToDate(record.practiceStats.lastAttemptDate as any);
          }

          if (record.competitiveStats?.lastAttemptDate)
            record.competitiveStats.lastAttemptDate = this.reportsService.queryStringEncodedDateToDate(record.competitiveStats.lastAttemptDate as any);

          return record;
        });

        return r;
      })
    );
  }

  getByUserData(parameters: PracticeModeReportFlatParameters): Observable<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByUserRecord>> {
    if (parameters)
      parameters = { grouping: PracticeModeReportGrouping.player };

    parameters.grouping = PracticeModeReportGrouping.player;
    this.reportsService.applyDefaultPaging(parameters);

    return this.http.get<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByUserRecord>>(this.apiUrl.build("reports/practice-mode", parameters)).pipe(
      map(r => {
        r.records = r.records.map(record => {
          for (let attempt of record.attempts || []) {
            // dates come in as strings because everything is horrible
            attempt.start = this.reportsService.queryStringEncodedDateToDate(attempt.start as any);
            attempt.end = this.reportsService.queryStringEncodedDateToDate(attempt.end as any);
          }

          return record;
        });

        return r;
      }));
  }

  getPlayerModeSummary(request: { userId: string; isPractice: boolean }): Observable<PracticeModeReportPlayerModeSummary> {
    return this.http.get<PracticeModeReportPlayerModeSummary>(this.apiUrl.build(`reports/practice-mode/user/${request.userId}/summary`, { isPractice: request.isPractice }));
  }
}
