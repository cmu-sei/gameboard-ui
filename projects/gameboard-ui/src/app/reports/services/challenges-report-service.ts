import { Injectable } from '@angular/core';
import { IReportService } from './ireport.service';
import { ChallengesReportFlatParameters, ChallengesReportParameters, ChallengesReportRecord } from '../components/reports/challenges-report/challenges-report.models';
import { Observable } from 'rxjs';
import { ReportResults } from '../reports-models';
import { UriService } from '../../services/uri.service';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '../../services/api-url.service';
import { ObjectService } from '@/services/object.service';

@Injectable({ providedIn: 'root' })
export class ChallengesReportService implements IReportService<ChallengesReportFlatParameters, ChallengesReportParameters, ChallengesReportRecord> {

  constructor(
    private apiRootService: ApiUrlService,
    private http: HttpClient,
    private objectService: ObjectService,
    private uriService: UriService) { }

  flattenParameters(parameters: ChallengesReportParameters): ChallengesReportFlatParameters {
    const retVal = {
      ...parameters,
      challengeSpecId: parameters.gameChallengeSpec?.challengeSpecId,
      gameId: parameters.gameChallengeSpec?.gameId,
      trackName: parameters.track?.track
    };

    return this.objectService.deleteKeys(retVal, "gameChallengeSpec", "track");
  }

  unflattenParameters(parameters: ChallengesReportFlatParameters) {
    const retVal: ChallengesReportParameters = {
      ...parameters,
      gameChallengeSpec: {
        challengeSpecId: parameters.challengeSpecId,
        gameId: parameters.gameId
      },
      track: {
        track: parameters.trackName,
      }
    };

    return this.objectService.deleteKeys(retVal, "challengeSpecId", "gameId", "trackName");
  }

  getReportData(parameters: ChallengesReportParameters): Observable<ReportResults<ChallengesReportRecord>> {
    const query = this.uriService.toQueryString(parameters);

    return this.http.get<ReportResults<ChallengesReportRecord>>(this.apiRootService.build(`/reports/challenges-report${query}`));
  }
}
