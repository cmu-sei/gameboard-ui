import { Injectable } from '@angular/core';
import { IReportService } from './ireport.service';
import { ChallengesReportParameters, ChallengesReportRecord } from '../components/reports/challenges-report/challenges-report.models';
import { Observable } from 'rxjs';
import { ReportResults } from '../reports-models';
import { UriService } from '../../services/uri.service';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '../../services/api-url.service';

@Injectable({
  providedIn: 'root'
})
export class ChallengesReportService implements IReportService<ChallengesReportParameters, ChallengesReportParameters, ChallengesReportRecord> {

  constructor(
    private apiRootService: ApiUrlService,
    private http: HttpClient,
    private uriService: UriService) { }

  flattenParameters(parameters: ChallengesReportParameters) {
    return parameters;
  }

  unflattenParameters(parameters: ChallengesReportParameters) {
    return parameters;
  }

  getReportData(parameters: ChallengesReportParameters): Observable<ReportResults<ChallengesReportRecord>> {
    const query = this.uriService.toQueryString(parameters);

    return this.http.get<ReportResults<ChallengesReportRecord>>(this.apiRootService.build(`/reports/challenges-report${query}`));
  }
}
