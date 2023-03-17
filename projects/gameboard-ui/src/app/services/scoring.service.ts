import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamChallengeScoreSummary } from '../api/scoring-models';
import { ConfigService } from '../utility/config.service';

@Injectable({ providedIn: 'root' })
export class ScoringService {

  private API_ROOT = '';

  constructor(
    private http: HttpClient,
    config: ConfigService
  ) {
    this.API_ROOT = config.apphost + 'api';
  }

  public getTeamChallengeScore(challengeId: string): Observable<TeamChallengeScoreSummary> {
    return this.http.get<TeamChallengeScoreSummary>(`${this.API_ROOT}/challenge/${challengeId}/score`);
  }
}
