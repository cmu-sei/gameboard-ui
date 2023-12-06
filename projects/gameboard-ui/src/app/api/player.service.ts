// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GameSessionService } from '@/services/game-session.service';
import { ConfigService } from '../utility/config.service';
import { ChangedPlayer, NewPlayer, Player, PlayerCertificate, PlayerEnlistment, Standing, Team, TeamAdvancement, TeamChallenge, TeamInvitation, TeamSummary, TimeWindow } from './player-models';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  url = '';

  private _playerSessionReset$ = new Subject<string>();
  public readonly playerSessionReset$ = this._playerSessionReset$.asObservable();

  private _playerSessionStarted$ = new Subject<string>();
  public readonly playerSessionStarted$ = this._playerSessionStarted$.asObservable();

  constructor(
    config: ConfigService,
    private http: HttpClient,
    private gameSessionService: GameSessionService,
  ) {
    this.url = config.apphost + 'api';
  }

  public list(search: any): Observable<Player[]> {
    return this.http.get<Player[]>(this.url + '/players', { params: search }).pipe(
      map(r => {
        r.forEach(p => p = this.transform(p));
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

  public start(player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.url}/player/${player.id}/start`, {}).pipe(
      map(p => this.transform(p) as Player),
      tap(p => this._playerSessionStarted$.next(p.id))
    );
  }

  public unenroll(id: string, asAdmin: boolean = false): Observable<void> {
    return this.http.delete<void>(`${this.url}/player/${id}?asAdmin=${asAdmin}`);
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
    return this.http.get<Standing[]>(this.url + '/scores', { params: search }).pipe(
      map(r => {
        r.forEach(s => this.transformStanding(s));
        return r;
      })
    );
  }

  public getTeam(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.url}/team/${id}`);
  }

  public getTeams(id: string): Observable<TeamSummary[]> {
    return this.http.get<TeamSummary[]>(`${this.url}/teams/${id}`);
  }

  public getTeamChallenges = (id: string): Observable<TeamChallenge[]> =>
    this.http.get<TeamChallenge[]>(`${this.url}/team/${id}/challenges`);

  public advanceTeams(model: TeamAdvancement): Observable<any> {
    return this.http.post<any>(this.url + '/team/advance', model);
  }

  public observeTeams(id: string): Observable<any> {
    return this.http.get<Team>(`${this.url}/teams/observe/${id}`);
  }

  public getCertificate(id: string): Observable<PlayerCertificate> {
    return this.http.get<PlayerCertificate>(`${this.url}/certificate/${id}`);
  }

  public getUserCertificates(): Observable<PlayerCertificate[]> {
    return this.http.get<PlayerCertificate[]>(`${this.url}/certificates`);
  }

  public promoteToManager(teamId: string, playerId: string, ctx: { currentManagerPlayerId: string, asAdmin?: boolean }): Observable<void> {
    return this.http.put<void>(`${this.url}/team/${teamId}/manager/${playerId}`, ctx);
  }

  public transform(p: Player, disallowedName: string | null = null): Player {
    // If the user has no name status but they changed their name, it's pending approval
    if (!p.nameStatus && p.approvedName !== p.name) {
      p.nameStatus = 'pending';
    }
    // Otherwise, if the user entered a name and an admin rejected it, but the new name entered is different, it's pending
    else if (p.nameStatus != 'pending' && disallowedName && disallowedName !== p.name) {
      p.nameStatus = 'pending';
    }

    p.pendingName = p.approvedName !== p.name
      ? p.name + (!!p.nameStatus ? `...${p.nameStatus}` : '...pending')
      : '';

    this.gameSessionService.addSession(p, p.sessionBegin, p.sessionEnd);

    return p;
  }

  private transformStanding(p: Standing): Standing {
    p.session = new TimeWindow(p.sessionBegin, p.sessionEnd);
    return p;
  }
}
