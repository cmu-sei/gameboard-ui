import { Injectable } from '@angular/core';
import { SupportReportFlatParameters, SupportReportParameters, SupportReportRecord } from '../components/reports/support-report/support-report.models';
import { ObjectService } from '../../services/object.service';
import { Observable } from 'rxjs';
import { ReportResults } from '../reports-models';
import { UriService } from '../../services/uri.service';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '../../services/api-url.service';
import { IReportService } from './ireport.service';
import { ReportsService } from '../reports.service';

@Injectable({ providedIn: 'root' })
export class SupportReportService implements IReportService<SupportReportFlatParameters, SupportReportParameters, SupportReportRecord> {

  constructor(
    private apiRoot: ApiUrlService,
    private http: HttpClient,
    private objectService: ObjectService,
    private reportsService: ReportsService,
    private uriService: UriService) { }

  public flattenParameters(parameters: SupportReportParameters) {
    let flattened: SupportReportFlatParameters = {
      ...parameters,
      challengeSpecId: parameters.gameChallengeSpec.challengeSpecId,
      gameId: parameters.gameChallengeSpec.gameId,
      labels: parameters.labels?.join(',') || '',
      openedDateStart: parameters.openedDateRange?.dateStart?.toLocaleDateString(),
      openedDateEnd: parameters.openedDateRange?.dateEnd?.toLocaleDateString(),
      minutesSinceOpen: this.reportsService.timespanToMinutes(parameters.timeSinceOpen),
      minutesSinceUpdate: this.reportsService.timespanToMinutes(parameters.timeSinceUpdate),
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
      timeSinceOpen: this.reportsService.minutesToTimeSpan(parseInt(parameters.minutesSinceOpen as any)),
      timeSinceUpdate: this.reportsService.minutesToTimeSpan(parseInt(parameters.minutesSinceUpdate as any)),
    };

    this.objectService.deleteKeys(structured, "gameId", "challengeId", "openedDateStart", "openedDateEnd");
    return structured;
  }

  getReportData(args: SupportReportParameters): Observable<ReportResults<SupportReportRecord>> {
    const flattened = this.flattenParameters(args);
    const query = this.uriService.toQueryString(flattened);
    return this.http.get<ReportResults<SupportReportRecord>>(`${this.apiRoot.build(`/reports/support-report${query}`)}`);
  }
}
