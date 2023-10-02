import { Injectable } from '@angular/core';
import { SupportReportFlatParameters, SupportReportParameters, SupportReportRecord } from './support-report.models';
import { ObjectService } from '../../../../services/object.service';
import { Observable, combineLatest, map } from 'rxjs';
import { ReportResults, minutesToTimeSpan, timespanToMinutes } from '../../../reports-models';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '../../../../services/api-url.service';
import { ReportsService } from '../../../reports.service';
import { SupportService } from '@/api/support.service';

@Injectable({ providedIn: 'root' })
export class SupportReportService {

  constructor(
    private apiUri: ApiUrlService,
    private http: HttpClient,
    private objectService: ObjectService,
    private reportsService: ReportsService,
    private supportService: SupportService) { }

  public flattenParameters(parameters: SupportReportParameters) {
    const defaultPaging = this.reportsService.getDefaultPaging();

    let flattened: SupportReportFlatParameters = {
      ...parameters,
      challengeSpecId: parameters.gameChallengeSpec?.challengeSpecId,
      gameId: parameters.gameChallengeSpec?.gameId,
      labels: parameters.labels?.join(','),
      openedDateStart: parameters.openedDateRange?.dateStart?.toLocaleDateString(),
      openedDateEnd: parameters.openedDateRange?.dateEnd?.toLocaleDateString(),
      minutesSinceOpen: timespanToMinutes(parameters.timeSinceOpen),
      minutesSinceUpdate: timespanToMinutes(parameters.timeSinceUpdate),
      pageNumber: parameters.paging.pageNumber || defaultPaging.pageNumber!,
      pageSize: parameters.paging.pageSize || defaultPaging.pageSize!,
      statuses: this.reportsService.flattenMultiSelectValues(parameters.statuses) || undefined
    };

    flattened = this.objectService.deleteKeys(
      flattened,
      "gameChallengeSpec",
      "openedDateRange",
      "timeSinceOpen",
      "timeSinceUpdate"
    );

    return flattened;
  }

  public unflattenParameters(parameters: SupportReportFlatParameters) {
    const defaultPaging = this.reportsService.getDefaultPaging();

    const structured: SupportReportParameters = {
      ...parameters,
      gameChallengeSpec: {
        gameId: parameters.gameId,
        challengeSpecId: parameters.challengeSpecId
      },
      labels: parameters.labels?.split(',') || [],
      openedDateRange: {
        dateStart: parameters.openedDateStart ? new Date(parameters.openedDateStart) : null,
        dateEnd: parameters.openedDateEnd ? new Date(parameters.openedDateEnd) : null,
      },
      paging: {
        pageNumber: parameters.pageNumber || defaultPaging.pageNumber!,
        pageSize: parameters.pageSize || defaultPaging.pageSize!
      },
      statuses: this.reportsService.unflattenMultiSelectValues(parameters.statuses),
      timeSinceOpen: minutesToTimeSpan(parseInt(parameters.minutesSinceOpen as any)),
      timeSinceUpdate: minutesToTimeSpan(parseInt(parameters.minutesSinceUpdate as any)),
    };

    this.objectService.deleteKeys(structured, "gameId", "challengeId", "openedDateStart", "openedDateEnd");
    return structured;
  }

  getReportData(args: SupportReportFlatParameters): Observable<ReportResults<SupportReportRecord>> {
    this.reportsService.applyDefaultPaging(args);
    return this.http.get<ReportResults<SupportReportRecord>>(this.apiUri.build("/reports/support", args));
  }

  getTicketStatuses(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUri.build("/reports/parameter/ticket-statuses")).pipe(map(statuses => statuses.sort()));
  }

  getTicketLabels(): Observable<string[]> {
    return this.supportService.listLabels(null);
  }
}
