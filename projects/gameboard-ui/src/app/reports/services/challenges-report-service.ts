import { Injectable } from '@angular/core';
import { ChallengesReportFlatParameters, ChallengesReportParameters, ChallengesReportRecord } from '../components/reports/challenges-report/challenges-report.models';
import { Observable } from 'rxjs';
import { ReportResults } from '../reports-models';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '../../services/api-url.service';
import { ObjectService } from '@/services/object.service';
import { ReportsService } from '../reports.service';

@Injectable({ providedIn: 'root' })
export class ChallengesReportService {

  constructor(
    private apiRootService: ApiUrlService,
    private http: HttpClient,
    private objectService: ObjectService,
    private reportsService: ReportsService) { }

  flattenParameters(parameters: ChallengesReportParameters): ChallengesReportFlatParameters {
    const retVal = {
      ...parameters,
      challengeSpecId: parameters.gameChallengeSpec?.challengeSpecId,
      registrationDateStart: this.reportsService.dateToQueryStringEncoded(parameters.registrationDateRange?.dateStart),
      registrationDateEnd: this.reportsService.dateToQueryStringEncoded(parameters.registrationDateRange?.dateEnd),
      gameId: parameters.gameChallengeSpec?.gameId,
      trackName: parameters.track?.track
    };

    const cleanedRetVal = this.objectService.deleteKeys<ChallengesReportFlatParameters>(retVal, "registrationDateRange", "gameChallengeSpec", "track");
    return cleanedRetVal;
  }

  unflattenParameters(parameters: ChallengesReportFlatParameters) {
    const retVal: ChallengesReportParameters = {
      ...parameters,
      registrationDateRange: {
        dateStart: parameters.registrationDateStart ? new Date(parameters.registrationDateStart) : undefined,
        dateEnd: parameters.registrationDateEnd ? new Date(parameters.registrationDateEnd) : undefined
      },
      gameChallengeSpec: {
        challengeSpecId: parameters.challengeSpecId,
        gameId: parameters.gameId
      },
      track: {
        track: parameters.trackName,
      }
    };

    return this.objectService.deleteKeys(retVal, "challengeSpecId", "gameId", "registrationStart", "registrationEnd", "trackName");
  }

  getReportData(parameters: ChallengesReportParameters): Observable<ReportResults<ChallengesReportRecord>> {
    return this.http.get<ReportResults<ChallengesReportRecord>>(this.apiRootService.build("/reports/challenges-report", parameters));
  }
}
