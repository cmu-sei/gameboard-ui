import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { CreateManualChallengeBonus, GameScore, TeamGameScoreSummary, UpdateGameAutoChallengeBonusConfig } from '../../api/scoring-models';
import { ConfigService } from '../../utility/config.service';
import { GameScoringConfig } from './scoring.models';

@Injectable({ providedIn: 'root' })
export class ScoringService {
  private API_ROOT = '';

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    config: ConfigService
  ) {
    this.API_ROOT = config.apphost + 'api';
  }

  public deleteManualBonus(manualBonusId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_ROOT}/bonus/manual/${manualBonusId}`);
  }

  public getGameScore(gameId: string): Observable<GameScore> {
    return this.http.get<GameScore>(this.apiUrl.build(`game/${gameId}/score`));
  }

  public getGameScoringConfig(gameId: string): Observable<GameScoringConfig> {
    return this.http.get<GameScoringConfig>(`${this.API_ROOT}/game/${gameId}/score/config`);
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

  public async deleteGameAutoChallengeBonuses(gameId: string) {
    return await firstValueFrom(this.http.delete<void>(`${this.API_ROOT}/game/${gameId}/bonus/config`));
  }

  public async updateGameAutoChallengeBonuses(gameId: string, config: UpdateGameAutoChallengeBonusConfig) {
    return await firstValueFrom(this.http.put<GameScoringConfig>(`${this.API_ROOT}/game/${gameId}/bonus/config`, config));
  }
}
