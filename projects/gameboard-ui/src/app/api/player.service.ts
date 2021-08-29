// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { ChangedPlayer, NewPlayer, Player, PlayerEnlistment, Standing, Team, TeamInvitation, TimeWindow } from './player-models';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(search: any): Observable<Player[]> {
    return this.http.get<Player[]>(this.url + '/players', {params: search}).pipe(
      map(r => {
        r.forEach(p => this.transform(p));
        return r;
      })
    );
  }
  public retrieve(id: string): Observable<Player> {
    return this.http.get<Player>(`${this.url}/player/${id}`).pipe(
      map(p => this.transform(p) as Player)
    );
  }
  public create(model: NewPlayer): Observable<Player> {
    return this.http.post<Player>(`${this.url}/player`, model).pipe(
      map(p => this.transform(p) as Player)
    );
  }
  public update(model: ChangedPlayer): Observable<any> {
    return this.http.put<any>(`${this.url}/player`, model);
  }
  public start(model: ChangedPlayer): Observable<Player> {
    return this.http.put<Player>(`${this.url}/player/start`, model).pipe(
      map(p => this.transform(p) as Player)
    );
  }
  public delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/player/${id}`);
  }
  public invite(id: string): Observable<TeamInvitation> {
    return this.http.post<TeamInvitation>(`${this.url}/player/${id}/invite`, null);
  }
  public enlist(model: PlayerEnlistment): Observable<Player> {
    return this.http.post<Player>(`${this.url}/player/enlist`, model).pipe(
      map(p => this.transform(p) as Player)
    );
  }
  public scores(search: any): Observable<Standing[]> {
    return this.http.get<Standing[]>(this.url + '/scores', {params: search}).pipe(
      map(r => {
        r.forEach(s => this.transform(s));
        return r;
      })
    );
  }
  public getTeam(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.url}/team/${id}`);
  }

  private transform(p: Player | Standing): Player | Standing {
    p.sponsorLogo = p.sponsor
      ? `${this.config.imagehost}/${p.sponsor}`
      : `${this.config.basehref}assets/sponsor.svg`
    ;
    p.session = new TimeWindow(p.sessionBegin, p.sessionEnd);
    return p;
  }
}
