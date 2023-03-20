import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateManualChallengeBonus, TeamGameScoreSummary } from '../api/scoring-models';
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

  public deleteManualBonus(manualBonusId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_ROOT}/bonus/manual/${manualBonusId}`);
  }

  public getTeamGameScore(teamId: string): Observable<TeamGameScoreSummary> {
    return this.http.get<TeamGameScoreSummary>(`${this.API_ROOT}/team/${teamId}/score`);
  }

  public createManualChallengeBonus(model: CreateManualChallengeBonus): Observable<void> {
    return this.http.post<void>(`${this.API_ROOT}/challenge/${model.challengeId}/bonus/manual`, {
      description: model.description,
      pointValue: model.pointValue
    });
  }
}
