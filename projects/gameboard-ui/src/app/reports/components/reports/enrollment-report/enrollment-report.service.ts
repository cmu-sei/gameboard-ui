import { Injectable } from '@angular/core';
import { EnrollmentReportByGameRecord, EnrollmentReportFlatParameters, EnrollmentReportLineChartViewModel, EnrollmentReportLineChartResponse, EnrollmentReportRecord, EnrollmentReportStatSummary, EnrollmentReportLineChartGroupViewModel } from './enrollment-report.models';
import { Observable, firstValueFrom, map, } from 'rxjs';
import { ReportResults } from '@/reports/reports-models';
import { ReportsService } from '@/reports/reports.service';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '@/services/api-url.service';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class EnrollmentReportService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private reportsService: ReportsService) { }

  getByGameData(parameters: EnrollmentReportFlatParameters | null): Observable<ReportResults<EnrollmentReportByGameRecord>> {
    parameters = parameters || {};
    return this.http.get<ReportResults<EnrollmentReportByGameRecord>>(this.apiUrl.build("reports/enrollment/by-game", parameters)).pipe(
      map(results => {
        for (const record of results.records) {
          record.game.executionClosed = this.reportsService.queryStringEncodedDateToDate(record.game.executionClosed as any)!;
          record.game.executionOpen = this.reportsService.queryStringEncodedDateToDate(record.game.executionOpen as any)!;
          record.game.registrationClosed = this.reportsService.queryStringEncodedDateToDate(record.game.registrationClosed as any)!;
          record.game.registrationOpen = this.reportsService.queryStringEncodedDateToDate(record.game.registrationOpen as any)!;
        }

        return results;
      })
    );
  }

  getReportData(parameters: EnrollmentReportFlatParameters): Observable<ReportResults<EnrollmentReportRecord>> {
    return this.http.get<ReportResults<EnrollmentReportRecord>>(this.apiUrl.build("reports/enrollment", parameters));
  }

  getSummaryStats(parameters: EnrollmentReportFlatParameters): Observable<EnrollmentReportStatSummary> {
    return this.http.get<EnrollmentReportStatSummary>(this.apiUrl.build("reports/enrollment/stats", parameters));
  }

  async getTrendData(parameters: EnrollmentReportFlatParameters | null): Promise<EnrollmentReportLineChartViewModel> {
    // ignore paging/tab parameters for the line chart
    const trendParams = { ...(parameters || {}) };
    delete trendParams.tab;
    delete trendParams.pageNumber;
    delete trendParams.pageSize;

    return await firstValueFrom(this
      .http
      .get<EnrollmentReportLineChartResponse>(this.apiUrl.build("reports/enrollment/trend", trendParams))
      .pipe(
        map(results => {
          const byDate = new Map<DateTime, EnrollmentReportLineChartGroupViewModel>();
          const byGameByDate = new Map<string, Map<DateTime, EnrollmentReportLineChartGroupViewModel>>();

          for (const group of Object.entries(results.byDate)) {
            byDate.set(DateTime.fromISO(group[0]), {
              totalCount: group[1].length,
              players: group[1].map(playerGame => results.players[playerGame.id])
            });
          }

          for (const gameGroup of Object.entries(results.byGameByDate)) {
            const gameDateGroups = new Map<DateTime, EnrollmentReportLineChartGroupViewModel>();

            for (const dateGroup of Object.entries(gameGroup[1])) {
              gameDateGroups.set(DateTime.fromISO(dateGroup[0]), {
                totalCount: dateGroup[1].length,
                players: dateGroup[1].map(playerGame => results.players[playerGame.id])
              });
            }

            byGameByDate.set(gameGroup[0], gameDateGroups);
          }

          return {
            byDate,
            byGameByDate,
            gameNames: results.games,
          } as EnrollmentReportLineChartViewModel;
        })
      )
    );
  }
}
