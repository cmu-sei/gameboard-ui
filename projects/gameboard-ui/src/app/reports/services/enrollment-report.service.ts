import { Injectable } from '@angular/core';
import { IReportService } from './ireport.service';
import { EnrollmentReportFlatParameters, EnrollmentReportLineChartGroup, EnrollmentReportParameters, EnrollmentReportRecord } from '../components/reports/enrollment-report/enrollment-report.models';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { ReportResults } from '../reports-models';
import { ReportsService } from '../reports.service';
import { SimpleEntity } from '@/api/models';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '@/services/api-url.service';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class EnrollmentReportService
  implements IReportService<EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportRecord> {

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private reportsService: ReportsService) { }

  flattenParameters(parameters: EnrollmentReportParameters): EnrollmentReportFlatParameters {
    return {
      enrollDateEnd: this.reportsService.dateToQueryStringEncoded(parameters.enrollDate?.dateEnd),
      enrollDateStart: this.reportsService.dateToQueryStringEncoded(parameters.enrollDate?.dateStart),
      pageNumber: parameters.paging.pageNumber,
      pageSize: parameters.paging.pageSize,
      seasons: this.reportsService.flattenMultiSelectValues(parameters.seasons),
      series: this.reportsService.flattenMultiSelectValues(parameters.series),
      sponsors: this.reportsService.flattenMultiSelectValues(parameters.sponsors?.map(s => s.id) || []),
      tracks: this.reportsService.flattenMultiSelectValues(parameters.tracks)
    };
  }

  unflattenParameters(parameters: EnrollmentReportFlatParameters): EnrollmentReportParameters {
    return {
      enrollDate: {
        dateStart: this.reportsService.queryStringEncodedDateToDate(parameters.enrollDateStart),
        dateEnd: this.reportsService.queryStringEncodedDateToDate(parameters.enrollDateEnd)
      },
      paging: {
        pageNumber: parameters.pageNumber || 0,
        pageSize: parameters.pageSize || ReportsService.DEFAULT_PAGE_SIZE
      },
      seasons: this.reportsService.unflattenMultiSelectValues(parameters.seasons),
      series: this.reportsService.unflattenMultiSelectValues(parameters.series),
      sponsors: this.reportsService
        .unflattenMultiSelectValues(parameters.sponsors)
        .map<SimpleEntity>(v => ({ id: v, name: '' })),
      tracks: this.reportsService.unflattenMultiSelectValues(parameters.tracks)
    };
  }

  getReportData(parameters: EnrollmentReportParameters): Observable<ReportResults<EnrollmentReportRecord>> {
    if (!parameters.paging?.pageSize) {
      parameters.paging = {
        pageSize: ReportsService.DEFAULT_PAGE_SIZE,
        pageNumber: 0
      };
    }

    return this.http.get<ReportResults<EnrollmentReportRecord>>(this.apiUrl.build("reports/enrollment", this.flattenParameters(parameters)));
  }

  getTrendData(parameters: EnrollmentReportParameters): Promise<Map<DateTime, EnrollmentReportLineChartGroup>> {
    return firstValueFrom(this
      .http
      .get<{ [dateString: string]: EnrollmentReportLineChartGroup }>(this.apiUrl.build("reports/enrollment/trend", this.flattenParameters(parameters)))
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
