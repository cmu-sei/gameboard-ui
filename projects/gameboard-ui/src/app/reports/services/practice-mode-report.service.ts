import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PracticeModeReportFlatParameters, PracticeModeReportParameters, PracticeModeReportRecord } from '../components/reports/practice-mode-report/practice-mode-report.model';
import { Observable } from 'rxjs';
import { ReportResults } from '../reports-models';
import { ReportsService } from '../reports.service';

@Injectable({
  providedIn: 'root'
})
export class PracticeModeReportService {

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private reportsService: ReportsService,
  ) { }

  getReportData(parameters: PracticeModeReportParameters): Observable<ReportResults<PracticeModeReportRecord>> {
    const flatParams = this.flattenParameters(parameters);
    if (!flatParams.pageSize || !flatParams.pageNumber) {
      flatParams.pageNumber = ReportsService.DEFAULT_PAGING.pageNumber;
      flatParams.pageSize = ReportsService.DEFAULT_PAGING.pageSize;
    }

    return this.http.get<ReportResults<PracticeModeReportRecord>>(this.apiUrl.build("reports/practice-mode", flatParams));
  }

  flattenParameters(parameters: PracticeModeReportParameters): PracticeModeReportFlatParameters {
    if (!parameters.paging || !parameters.paging.pageSize) {
      parameters.paging = ReportsService.DEFAULT_PAGING;
    }

    return {
      practiceDateStart: this.reportsService.dateToQueryStringEncoded(parameters?.practiceDate?.dateStart),
      practiceDateEnd: this.reportsService.dateToQueryStringEncoded(parameters?.practiceDate?.dateEnd),
      games: this.reportsService.flattenMultiSelectValues(parameters.games),
      series: this.reportsService.flattenMultiSelectValues(parameters.series),
      sponsors: this.reportsService.flattenMultiSelectValues(parameters.sponsors),
      tracks: this.reportsService.flattenMultiSelectValues(parameters.tracks),
      pageNumber: parameters.paging.pageNumber,
      pageSize: parameters.paging.pageSize
    };
  }

  unflattenParameters(parameters: PracticeModeReportFlatParameters): PracticeModeReportParameters {
    if (!parameters.pageSize || !parameters.pageNumber) {
      parameters.pageNumber = ReportsService.DEFAULT_PAGING.pageNumber;
      parameters.pageSize = ReportsService.DEFAULT_PAGING.pageSize;
    }

    return {
      practiceDate: {
        dateStart: this.reportsService.queryStringEncodedDateToDate(parameters.practiceDateStart),
        dateEnd: this.reportsService.queryStringEncodedDateToDate(parameters.practiceDateEnd)
      },
      games: this.reportsService.unflattenMultiSelectValues(parameters.games),
      series: this.reportsService.unflattenMultiSelectValues(parameters.series),
      sponsors: this.reportsService.unflattenMultiSelectValues(parameters.sponsors),
      tracks: this.reportsService.unflattenMultiSelectValues(parameters.tracks),
      paging: {
        pageNumber: parameters.pageNumber,
        pageSize: parameters.pageSize
      }
    };
  }
}
