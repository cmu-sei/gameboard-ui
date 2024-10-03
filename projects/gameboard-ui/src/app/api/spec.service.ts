// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { ChallengeSpecBonusViewModel, ChangedSpec, ExternalSpec, GameChallengeSpecs, GetChallengeSpecQuestionPerformanceResult, NewSpec, Spec } from './spec-models';

@Injectable({ providedIn: 'root' })
export class SpecService {
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

  public listByGame(): Promise<GameChallengeSpecs[]> {
    return firstValueFrom(this.http.get<GameChallengeSpecs[]>(this.url + "/challengespecs/by-game"));
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
