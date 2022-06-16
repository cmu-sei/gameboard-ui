// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { ChallengeGate } from './board-models';
import { ChangedGame, Game, GameGroup, NewGame, SessionForecast, UploadedFile } from './game-models';
import { TimeWindow } from './player-models';
import { Spec } from './spec-models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  url = '';
  private cache: CachedGame[] = [];
  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(filter: any): Observable<Game[]> {
    return this.http.get<Game[]>(this.url + '/games', { params: filter }).pipe(
      map(r => {
        r.forEach(g => this.transform(g));
        return r;
      })
    );
  }

  public listGrouped(filter: any): Observable<GameGroup[]> {
    return this.http.get<GameGroup[]>(this.url + '/games/grouped', { params: filter }).pipe(
      map(r => {
        r.forEach(c => {
          c.monthName = this.monthName(c.month);
          c.games.forEach(g => this.transform(g))
        });
        return r;
      })
    );
  }

  public retrieve(id: string): Observable<Game> {
    const cached = this.tryCache(id);
    return !!cached
      ? of(cached)
      : this.http.get<Game>(`${this.url}/game/${id}`).pipe(
        map(m => this.transform(m)),
        tap(m => this.addOrUpdateCache(m))
      );
  }

  public create(model: NewGame): Observable<Game> {
    return this.http.post<Game>(`${this.url}/game`, model);
  }

  public update(model: ChangedGame): Observable<any> {
    return this.http.put<any>(`${this.url}/game`, model).pipe(
      tap(m => this.removeCache(model.id))
    );
  }
  public delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/game/${id}`).pipe(
      tap(m => this.removeCache(id))
    );
  }
  public retrieveSpecs(id: string): Observable<Spec[]> {
    return this.http.get<Spec[]>(`${this.url}/game/${id}/specs`);
  }

  public sessionForecast(id: string): Observable<SessionForecast[]> {
    return this.http.get<SessionForecast[]>(`${this.url}/game/${id}/sessions`);
  }

  public uploadImage(id: string, type: string, file: File): Observable<UploadedFile> {
    const payload: FormData = new FormData();
    payload.append('file', file, file.name);
    return this.http.post<UploadedFile>(`${this.url}/game/${id}/${type}`, payload);
  }

  public deleteImage(id: string, type: string): Observable<any> {
    return this.http.delete(`${this.url}/game/${id}/${type}`);
  }

  public rerank(id: string): Observable<any> {
    return this.http.post<any>(`${this.url}/game/${id}/rerank`, null);
  }

  public getPrereqs(g: string): Observable<ChallengeGate[]> {
    return this.http.get<ChallengeGate[]>(`${this.url}/challengegates`, {params: { g }});
  }
  public savePrereq(g: ChallengeGate): Observable<ChallengeGate> {
    return this.http.post<ChallengeGate>(`${this.url}/challengegate`, g);
  }
  public deletePrereq(id: string): Observable<any> {
    return this.http.delete(`${this.url}/challengegate/${id}`);
  }

  private tryCache(id: string, limit: number = 20): Game | null {
    const item = this.cache.find(c => c.id === id);
    const entity = !!item ? item.latest(limit) : null;
    // console.log(id + ' cache ' + (entity ? 'hit' : 'miss'));

    if (!entity) { this.removeCache(id); }
    return entity;
  }
  private addOrUpdateCache(game: Game): void {
    if (!game || !game.id) { return; }
    // console.log(game.id + ' cache load');
    const item = this.cache.find(c => c.id === game.id);
    if (item) {
      item.update(game);
    } else {
      this.cache.push(new CachedGame(game));
    }
  }
  private removeCache(id: string): void {
    const item = this.cache.find(c => c.id === id);
    if (!item) { return; }
    // console.log(id + ' cache unload');
    this.cache.splice(
      this.cache.indexOf(item), 1
    );
  }

  private transform(game: Game): Game {
    game.cardUrl = game.logo
      ? `${this.config.imagehost}/${game.logo}`
      : `${this.config.basehref}assets/card.png`
    ;

    game.mapUrl = game.background
      ? `${this.config.imagehost}/${game.background}`
      : `${this.config.basehref}assets/map.png`
    ;

    game.modeUrl = game.mode
      ? `${this.config.basehref}assets/${game.mode}.png`
      : `${this.config.basehref}assets/vm.png`
    ;

    game.session = new TimeWindow(game.gameStart, game.gameEnd);

    game.registration = new TimeWindow(game.registrationOpen, game.registrationClose);

    return game;
  }

  private monthName(monthNum: number) {
    if (!monthNum || monthNum < 1 || monthNum > 12)
      return '';
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][monthNum - 1];
  }

}
export class CachedGame {
  id: string;
  ts: number = 0;
  game: Game;
  constructor(
    game: Game
  ) {
    this.game = game;
    this.id = this.game.id;
    this.ts = Date.now();
  }
  update(game: Game): void {
    this.game = game;
    this.ts = Date.now();
  }
  latest(limit: number = 10): Game | null {
    const hit = Date.now() - this.ts < (limit * 1000);
    return hit ? this.game : null;
  }

}
