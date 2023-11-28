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
    return this.http.get<ReportResults<EnrollmentReportByGameRecord>>(this.apiUrl.build("reports/enrollment/by-game", pagedParameters));
  }

  getReportData(parameters: EnrollmentReportFlatParameters): Observable<ReportResultsWithOverallStats<EnrollmentReportStatSummary, EnrollmentReportRecord>> {
    const pagedParameters = this.reportsService.applyDefaultPaging(parameters);
    return this.http.get<ReportResultsWithOverallStats<EnrollmentReportStatSummary, EnrollmentReportRecord>>(this.apiUrl.build("reports/enrollment", pagedParameters));
  }

  getTrendData(parameters: EnrollmentReportFlatParameters): Promise<Map<DateTime, EnrollmentReportLineChartGroup>> {
    // ignore paging parameters for the line chart
    parameters.pageNumber = undefined;
    parameters.pageSize = undefined;

    return firstValueFrom(this
      .http
      .get<{ [dateString: string]: EnrollmentReportLineChartGroup }>(this.apiUrl.build("reports/enrollment/trend", parameters))
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
