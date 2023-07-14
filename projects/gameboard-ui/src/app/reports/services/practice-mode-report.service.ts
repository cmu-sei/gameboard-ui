import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PracticeModeReportFlatParameters, PracticeModeReportParameters, PracticeModeReportByUserRecord, PracticeModeReportByChallengeRecord, PracticeModeReportRecord, PracticeModeReportGrouping } from '../components/reports/practice-mode-report/practice-mode-report.models';
import { Observable, map } from 'rxjs';
import { ReportResults, ReportSponsor } from '../reports-models';
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

  getData(parameters: PracticeModeReportParameters): Observable<ReportResults<PracticeModeReportRecord>> {
    switch (parameters.grouping) {
      case PracticeModeReportGrouping.challenge:
        return this.getByChallengeData(parameters);
      case PracticeModeReportGrouping.player:
        return this.getByUserData(parameters);
      default: {
        const errorMessage = `Couldn't retrive practice mode report data for grouping "${parameters.grouping}"`;
        this.log.logError(errorMessage);
        throw new Error(errorMessage);
      }
    }
  }

  getByChallengeData(parameters: PracticeModeReportParameters): Observable<ReportResults<PracticeModeReportByChallengeRecord>> {
    parameters.grouping = PracticeModeReportGrouping.challenge;
    parameters.paging = parameters.paging || this.reportsService.getDefaultPaging();
    const flatParams = this.flattenParameters(parameters);

    return this.http.get<ReportResults<PracticeModeReportByChallengeRecord>>(this.apiUrl.build("reports/practice-mode", flatParams));
  }

  getByUserData(parameters: PracticeModeReportParameters): Observable<ReportResults<PracticeModeReportByUserRecord>> {
    parameters.grouping = PracticeModeReportGrouping.player;
    parameters.paging = parameters.paging || this.reportsService.getDefaultPaging();
    const flatParams = this.flattenParameters(parameters);

    return this.http.get<ReportResults<PracticeModeReportByUserRecord>>(this.apiUrl.build("reports/practice-mode", flatParams)).pipe(
      map(r => {
        r.records = r.records.map(record => {
          // dates come in as strings because everything is horrible
          for (let attempt of record.attempts || []) {
            attempt.start = (attempt.start ? new Date(attempt.start) : undefined);
            attempt.end = (attempt.end ? new Date(attempt.end) : undefined);
          }

          return record;
        });

        return r;
      }));
  }

  flattenParameters(parameters: PracticeModeReportParameters): PracticeModeReportFlatParameters {
    if (!parameters.paging || !parameters.paging.pageSize) {
      parameters.paging = this.reportsService.getDefaultPaging();
    }

    return {
      practiceDateStart: this.reportsService.dateToQueryStringEncoded(parameters?.practiceDate?.dateStart),
      practiceDateEnd: this.reportsService.dateToQueryStringEncoded(parameters?.practiceDate?.dateEnd),
      games: this.reportsService.flattenMultiSelectValues(parameters.games.map(g => g.id)),
      seasons: this.reportsService.flattenMultiSelectValues(parameters.seasons),
      series: this.reportsService.flattenMultiSelectValues(parameters.series),
      sponsors: this.reportsService.flattenMultiSelectValues(parameters.sponsors.map(s => s.id)),
      tracks: this.reportsService.flattenMultiSelectValues(parameters.tracks),
      grouping: parameters.grouping,
      pageNumber: parameters.paging.pageNumber,
      pageSize: parameters.paging.pageSize
    };
  }

  unflattenParameters(parameters: PracticeModeReportFlatParameters): PracticeModeReportParameters {
    if (!parameters.pageSize || !parameters.pageNumber) {
      const defaultPaging = this.reportsService.getDefaultPaging();
      parameters.pageNumber = defaultPaging.pageNumber;
      parameters.pageSize = defaultPaging.pageSize;
    }

    return {
      practiceDate: {
        dateStart: this.reportsService.queryStringEncodedDateToDate(parameters.practiceDateStart),
        dateEnd: this.reportsService.queryStringEncodedDateToDate(parameters.practiceDateEnd)
      },
      games: this.reportsService
        .unflattenMultiSelectValues(parameters.games)
        .map<SimpleEntity>(s => ({ id: s, name: '' })),
      grouping: parameters.grouping,
      seasons: this.reportsService.unflattenMultiSelectValues(parameters.seasons),
      series: this.reportsService.unflattenMultiSelectValues(parameters.series),
      sponsors: this.reportsService
        .unflattenMultiSelectValues(parameters.sponsors)
        .map<ReportSponsor>(v => ({ id: v, name: '', logoFileName: '' })),
      tracks: this.reportsService.unflattenMultiSelectValues(parameters.tracks),
      paging: {
        pageNumber: parameters.pageNumber,
        pageSize: parameters.pageSize
      }
    };
  }
}
