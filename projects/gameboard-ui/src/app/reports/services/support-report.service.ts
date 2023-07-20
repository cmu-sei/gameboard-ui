import { Injectable } from '@angular/core';
import { SupportReportFlatParameters, SupportReportParameters, SupportReportRecord } from '../components/reports/support-report/support-report.models';
import { ObjectService } from '../../services/object.service';
import { Observable } from 'rxjs';
import { ReportResults } from '../reports-models';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '../../services/api-url.service';
import { ReportsService } from '../reports.service';

@Injectable({ providedIn: 'root' })
export class SupportReportService {

  constructor(
    private apiUri: ApiUrlService,
    private http: HttpClient,
    private objectService: ObjectService,
    private reportsService: ReportsService,) { }

  public flattenParameters(parameters: SupportReportParameters) {
    const defaultPaging = this.reportsService.getDefaultPaging();

    let flattened: SupportReportFlatParameters = {
      ...parameters,
      challengeSpecId: parameters.gameChallengeSpec?.challengeSpecId,
      gameId: parameters.gameChallengeSpec?.gameId,
      labels: parameters.labels?.join(','),
      openedDateStart: parameters.openedDateRange?.dateStart?.toLocaleDateString(),
      openedDateEnd: parameters.openedDateRange?.dateEnd?.toLocaleDateString(),
      minutesSinceOpen: this.reportsService.timespanToMinutes(parameters.timeSinceOpen),
      minutesSinceUpdate: this.reportsService.timespanToMinutes(parameters.timeSinceUpdate),
      pageNumber: parameters.paging.pageNumber || defaultPaging.pageNumber!,
      pageSize: parameters.paging.pageSize || defaultPaging.pageSize!,
      status: parameters.status || undefined
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
        dateStart: parameters.openedDateStart ? new Date(parameters.openedDateStart) : undefined,
        dateEnd: parameters.openedDateEnd ? new Date(parameters.openedDateEnd) : undefined,
      },
      paging: {
        pageNumber: parameters.pageNumber || defaultPaging.pageNumber!,
        pageSize: parameters.pageSize || defaultPaging.pageSize!
      },
      timeSinceOpen: this.reportsService.minutesToTimeSpan(parseInt(parameters.minutesSinceOpen as any)),
      timeSinceUpdate: this.reportsService.minutesToTimeSpan(parseInt(parameters.minutesSinceUpdate as any)),
    };

    this.objectService.deleteKeys(structured, "gameId", "challengeId", "openedDateStart", "openedDateEnd");
    return structured;
  }

  getReportData(args: SupportReportFlatParameters): Observable<ReportResults<SupportReportRecord>> {
    this.reportsService.applyDefaultPaging(args);
    return this.http.get<ReportResults<SupportReportRecord>>(this.apiUri.build("/reports/support", args));
  }
}
