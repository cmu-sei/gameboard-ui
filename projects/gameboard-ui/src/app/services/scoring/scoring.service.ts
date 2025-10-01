// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { DateTime } from 'luxon';
import { ApiUrlService } from '@/services/api-url.service';
import { ConfigService } from '../../utility/config.service';
import { CreateManualChallengeBonus, CreateManualTeamBonus, GameAutoBonusConfig, GameScore, GameScoringConfig, ScoreboardData, TeamScoreQueryResponse, UpdateGameAutoChallengeBonusConfig } from './scoring.models';
import { ApiDateTimeService } from '../api-date-time.service';

@Injectable({ providedIn: 'root' })
export class ScoringService {
  private API_ROOT = '';

  constructor(
    private apiDateTime: ApiDateTimeService,
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    config: ConfigService
  ) {
    this.API_ROOT = config.apphost + 'api';
  }

  public deleteManualBonus(manualBonusId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_ROOT}/bonus/manual/${manualBonusId}`);
  }

  public getGameAutoBonusConfig(gameId: string): Observable<GameAutoBonusConfig> {
    return this.http.get<GameAutoBonusConfig>(`${this.API_ROOT}/game/${gameId}/bonus/config`);
  }

  public getGameScore(gameId: string): Observable<GameScore> {
    return this.http.get<GameScore>(this.apiUrl.build(`game/${gameId}/score`));
  }

  public getScoreboard(gameId: string): Observable<ScoreboardData> {
    return this.http.get<ScoreboardData>(this.apiUrl.build(`game/${gameId}/scoreboard`)).pipe(map(s => {
      for (let t of s.teams) {
        if (!t.sessionEnds)
          continue;

        t.sessionEnds = this.apiDateTime.toDateTime(t.sessionEnds as any) as DateTime;
      }

      if (!s.game.isLiveUntil)
        return s;

      s.game.isLiveUntil = this.apiDateTime.toDateTime(s.game.isLiveUntil as any) as DateTime;
      return s;
    }));
  }

  public getGameScoringConfig(gameId: string): Observable<GameScoringConfig> {
    return this.http.get<GameScoringConfig>(`${this.API_ROOT}/game/${gameId}/score/config`);
  }

  public getTeamScore(teamId: string): Observable<TeamScoreQueryResponse> {
    return this.http.get<TeamScoreQueryResponse>(`${this.API_ROOT}/team/${teamId}/score`);
  }

  public createManualChallengeBonus(model: CreateManualChallengeBonus): Observable<void> {
    return this.http.post<void>(`${this.API_ROOT}/challenge/${model.challengeId}/bonus/manual`, {
      description: model.description,
      pointValue: model.pointValue
    });
  }

  public createManualTeamBonus(model: CreateManualTeamBonus): Observable<void> {
    return this.http.post<void>(`${this.API_ROOT}/team/${model.teamId}/bonus/manual`, {
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
