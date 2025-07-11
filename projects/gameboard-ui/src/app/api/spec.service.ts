// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { ChallengeSpecBonusViewModel, ChangedSpec, ExternalSpec, GameChallengeSpecs, GetChallengeSpecQuestionPerformanceResult, NewSpec, Spec } from './spec-models';
import { ApiUrlService } from '@/services/api-url.service';

@Injectable({ providedIn: 'root' })
export class SpecService {
  private readonly apiUrlService = inject(ApiUrlService);
  url = '';

  constructor(
    config: ConfigService,
    private http: HttpClient
  ) {
    this.url = config.apphost + 'api';
  }

  public getQuestionPerformance(specId: string): Promise<GetChallengeSpecQuestionPerformanceResult> {
    return firstValueFrom(this.http.get<GetChallengeSpecQuestionPerformanceResult>(`${this.url}/challengespecs/${specId}/question-performance`));
  }

  public list(filter: any): Observable<ExternalSpec[]> {
    return this.http.get<Spec[]>(this.url + '/challengespecs', { params: filter });
  }

  public listByGame(gameId?: string): Promise<GameChallengeSpecs[]> {
    return firstValueFrom(this.http.get<GameChallengeSpecs[]>(this.apiUrlService.build("challengespecs/by-game", { gameId })));
  }

  public retrieve(id: string): Observable<Spec> {
    return this.http.get<Spec>(`${this.url}/challengespec/${id}`);
  }

  public create(model: NewSpec): Observable<Spec> {
    return this.http.post<Spec>(`${this.url}/challengespec`, model);
  }

  public getBonuses(specId?: string): Observable<ChallengeSpecBonusViewModel[]> {
    if (!specId) return of([]);

    return this.http.get<ChallengeSpecBonusViewModel[]>(`${this.url}/challengespec/${specId}/bonuses`);
  }

  public update(model: ChangedSpec): Observable<any> {
    return this.http.put<any>(`${this.url}/challengespec`, model);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/challengespec/${id}`);
  }

  public sync(id: string): Observable<any> {
    return this.http.post<any>(`${this.url}/challengespecs/sync/${id}`, null);
  }
}
