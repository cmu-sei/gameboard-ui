import { Injectable } from '@angular/core';
import { PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord } from '../components/reports/players-report/players-report.models';
import { Observable } from 'rxjs';
import { ReportResults } from '../reports-models';
import { ObjectService } from '../../services/object.service';
import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PlayersReportService {

  constructor(
    private apiUri: ApiUrlService,
    private http: HttpClient,
    private objectService: ObjectService) { }

  flattenParameters(parameters: PlayersReportParameters): PlayersReportFlatParameters {
    const flattened: PlayersReportFlatParameters = {
      challengeSpecId: parameters.gameChallengeSpec?.challengeSpecId,
      gameId: parameters.gameChallengeSpec?.gameId,
      playerSessionStartBeginDate: parameters.sessionStartWindow?.dateStart || undefined,
      playerSessionStartEndDate: parameters.sessionStartWindow?.dateEnd || undefined,
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
        dateStart: sessionStartBeginDate || null,
        dateEnd: sessionStartEndDate || null
      } : undefined,
      track: {
        track: trackName
      },
    };
  }

  getReportData(parameters: PlayersReportParameters): Observable<ReportResults<PlayersReportRecord>> {
    const flatParameters = this.flattenParameters(parameters);
    return this.http.get<ReportResults<PlayersReportRecord>>(this.apiUri.build("/reports/players-report", flatParameters));
  }
}
