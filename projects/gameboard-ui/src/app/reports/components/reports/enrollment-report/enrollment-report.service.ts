import { Injectable } from '@angular/core';
import { EnrollmentReportByGameRecord, EnrollmentReportFlatParameters, EnrollmentReportLineChartGroup, EnrollmentReportRecord, EnrollmentReportStatSummary } from './enrollment-report.models';
import { Observable, firstValueFrom, map, } from 'rxjs';
import { ReportResults, ReportResultsWithOverallStats } from '@/reports/reports-models';
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
    const pagedParameters = this.reportsService.applyDefaultPaging(parameters);
    return this.http.get<ReportResults<EnrollmentReportByGameRecord>>(this.apiUrl.build("reports/enrollment/by-game", pagedParameters)).pipe(
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

  getReportData(parameters: EnrollmentReportFlatParameters): Observable<ReportResultsWithOverallStats<EnrollmentReportStatSummary, EnrollmentReportRecord>> {
    const pagedParameters = this.reportsService.applyDefaultPaging(parameters);
    return this.http.get<ReportResultsWithOverallStats<EnrollmentReportStatSummary, EnrollmentReportRecord>>(this.apiUrl.build("reports/enrollment", pagedParameters));
  }

  async getTrendData(parameters: EnrollmentReportFlatParameters): Promise<Map<DateTime, EnrollmentReportLineChartGroup>> {
    // ignore paging/tab parameters for the line chart
    const trendFriendlyParams = { ...parameters, pageNumber: undefined, pageSize: undefined };
    delete trendFriendlyParams.tab;

    return await firstValueFrom(this
      .http
      .get<{ [dateString: string]: EnrollmentReportLineChartGroup }>(this.apiUrl.build("reports/enrollment/trend", trendFriendlyParams))
      .pipe(
        map(results => {
          const mapped = new Map<DateTime, EnrollmentReportLineChartGroup>();

          for (const entry of Object.entries(results)) {
            mapped.set(DateTime.fromISO(entry[0]), entry[1]);
          }

          return mapped;
        })
      )
    );
  }
}
