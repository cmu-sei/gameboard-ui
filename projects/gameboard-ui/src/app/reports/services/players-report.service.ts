import { Injectable } from '@angular/core';
import { IReportService } from './ireport.service';
import { PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord } from '../components/reports/players-report/players-report.models';
import { Observable } from 'rxjs';
import { ReportResults, ReportTrackParameterModifier } from '../reports-models';
import { ObjectService } from '../../services/object.service';
import { ApiUrlService } from '@/services/api-url.service';
import { UriService } from '@/services/uri.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PlayersReportService implements IReportService<PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord> {

  constructor(
    private apiUrlService: ApiUrlService,
    private http: HttpClient,
    private objectService: ObjectService,
    private uriService: UriService) { }

  flattenParameters(parameters: PlayersReportParameters): PlayersReportFlatParameters {
    const flattened: PlayersReportFlatParameters = {
      challengeSpecId: parameters.gameChallengeSpec?.challengeSpecId,
      gameId: parameters.gameChallengeSpec?.gameId,
      playerSessionStartBeginDate: parameters.sessionStartWindow?.dateStart,
      playerSessionStartEndDate: parameters.sessionStartWindow?.dateEnd,
      trackModifier: parameters.track?.modifier,
      trackName: parameters.track?.track,
      ...parameters
    };

    this.objectService.deleteKeys(flattened, "gameChallengeSpec", "track", "sessionStartWindow");

    return flattened;
  }

  unflattenParameters(parameters?: PlayersReportFlatParameters): PlayersReportParameters {
    if (!parameters) {
      return {
        gameChallengeSpec: {}
      };
    }

    const gameId = parameters.gameId;
    const challengeSpecId = parameters.challengeSpecId;
    const trackName = parameters.trackName;
    const trackModifier = parameters.trackModifier;
    const sessionStartBeginDate = parameters.playerSessionStartBeginDate;
    const sessionStartEndDate = parameters.playerSessionStartEndDate;

    this.objectService.deleteKeys(
      parameters,
      "challengeSpecId",
      "gameId",
      "trackModifier",
      "trackName",
      "playerSessionStartBeginDate",
      "playerSessionStartEndDate"
    );

    return {
      ...parameters,
      gameChallengeSpec: {
        gameId,
        challengeSpecId
      },
      sessionStartWindow: sessionStartBeginDate || sessionStartEndDate ? {
        dateStart: sessionStartBeginDate,
        dateEnd: sessionStartEndDate
      } : undefined,
      track: {
        track: trackName,
        modifier: trackModifier || ReportTrackParameterModifier.CompetedInThisTrack,
      },
    };
  }

  getReportData(parameters?: PlayersReportFlatParameters): Observable<ReportResults<PlayersReportRecord>> {
    const query = this.uriService.toQueryString(parameters);
    return this.http.get<ReportResults<PlayersReportRecord>>(this.apiUrlService.build(`/reports/players-report${query}`));
  }
}
