import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PracticeModeReportFlatParameters, PracticeModeReportByUserRecord, PracticeModeReportByChallengeRecord, PracticeModeReportGrouping, PracticeModeReportByPlayerModePerformanceRecord, PracticeModeReportPlayerModeSummary, PracticeModeReportOverallStats, PracticeModeReportChallengeDetail, PracticeModeReportChallengeDetailParameters } from './practice-mode-report.models';
import { Observable, firstValueFrom, map } from 'rxjs';
import { ReportResultsWithOverallStats } from '../../../reports-models';
import { ReportsService } from '../../../reports.service';
import { DateTime } from 'luxon';
import { PagingArgs } from '@/api/models';

@Injectable({ providedIn: 'root' })
export class PracticeModeReportService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private reportsService: ReportsService,
  ) { }

  getByChallengeData(parameters: PracticeModeReportFlatParameters | null): Observable<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByChallengeRecord>> {
    const finalParams = { ... (parameters || {}), ...{ grouping: PracticeModeReportGrouping.challenge } };
    return this.http.get<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByChallengeRecord>>(this.apiUrl.build("reports/practice-area", finalParams));
  }

  getChallengeDetail(challengeSpecId: string, parameters: PracticeModeReportFlatParameters | null | undefined, challengeDetailParameters: PracticeModeReportChallengeDetailParameters | null | undefined, paging: PagingArgs | null | undefined): Promise<PracticeModeReportChallengeDetail> {
    console.log("get!", challengeDetailParameters);
    return firstValueFrom(this.http.get<PracticeModeReportChallengeDetail>(this.apiUrl.build(`reports/practice-area/challenge-spec/${challengeSpecId}`, { ...parameters, ...challengeDetailParameters, ...paging })).pipe(
      map(result => {
        return {
          ...result,
          users: result.users.map(u => {
            u.lastAttemptDate = DateTime.fromJSDate(new Date(u.lastAttemptDate.toString()));
            u.bestAttemptDate = DateTime.fromJSDate(new Date(u.bestAttemptDate.toString()));

            return u;
          })
        };
      })
    ));
  }

  getByPlayerModePerformance(parameters: PracticeModeReportFlatParameters | null): Observable<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByPlayerModePerformanceRecord>> {
    const finalParams = { ... (parameters || {}), ...{ grouping: PracticeModeReportGrouping.playerModePerformance } };

    return this.http.get<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByPlayerModePerformanceRecord>>(this.apiUrl.build("reports/practice-area", finalParams)).pipe(
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

  getByUserData(parameters: PracticeModeReportFlatParameters | null): Observable<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByUserRecord>> {
    const finalParams = { ... (parameters || {}), ...{ grouping: PracticeModeReportGrouping.player } };

    return this.http.get<ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByUserRecord>>(this.apiUrl.build("reports/practice-area", finalParams)).pipe(
      map(r => {
        r.records = r.records.map(record => {
          for (let attempt of record.attempts || []) {
            // dates come in as strings because everything is horrible
            attempt.start = this.reportsService.queryStringEncodedDateToDate(attempt.start as any)!;
            attempt.end = this.reportsService.queryStringEncodedDateToDate(attempt.end as any);
          }

          return record;
        });

        return r;
      }));
  }

  getPlayerModeSummary(request: { userId: string; isPractice: boolean }): Observable<PracticeModeReportPlayerModeSummary> {
    return this.http.get<PracticeModeReportPlayerModeSummary>(this.apiUrl.build(`reports/practice-area/user/${request.userId}/summary`, { isPractice: request.isPractice }));
  }
}
