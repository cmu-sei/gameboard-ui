// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GameSessionService } from '../services/game-session.service';
import { ConfigService } from '../utility/config.service';
import { ChangedPlayer, NewPlayer, Player, PlayerCertificate, PlayerEnlistment, SessionChangeRequest, Standing, Team, TeamAdvancement, TeamChallenge, TeamInvitation, TeamSummary, TimeWindow } from './player-models';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  url = '';

  private _teamSessionChanged$ = new Subject<string>();
  public teamSessionChanged$ = this._teamSessionChanged$.asObservable();

  private _playerSessionReset$ = new Subject<string>();
  public playerSessionReset$ = this._playerSessionReset$.asObservable();

  constructor(
    private http: HttpClient,
    private config: ConfigService,
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

  public updateIsSyncStartReady(playerId: string, model: { isReady: boolean }) {
    return this.http.put(`${this.url}/player/${playerId}/ready`, model);
  }

  public start(player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.url}/player/${player.id}/start`, {}).pipe(
      map(p => this.transform(p) as Player)
    );
  }

  public resetSession(request: { player: Player, unenrollTeam: boolean }): Observable<any> {
    return this.http.post<void>(`${this.url}/player/${request.player.id}/session`, { isManualReset: true, unenrollTeam: request.unenrollTeam }).pipe(
      map(r => {
        delete request.player.session;
        return;
      }),
      tap(_ => this._playerSessionReset$.next(request.player.id))
    );
  }

  public updateSession(model: SessionChangeRequest): Observable<void> {
    return this.http.put<any>(`${this.url}/team/session`, model).pipe(
      tap(_ => this._teamSessionChanged$.next(model.teamId)
      ));
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
    return this.http.get<Team>(`${this.url}/team/${id}`).pipe(
      map(t => {
        t.sponsorList = t.sponsorList.map(s => this.transformSponsorUrl(s));
        return t;
      })
    );
  }

  public getTeams(id: string): Observable<TeamSummary[]> {
    return this.http.get<TeamSummary[]>(`${this.url}/teams/${id}`).pipe(
      map(result => result.map(t => this.transformSponsor(t)))
    );
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
    p.sponsorLogo = this.transformSponsorUrl(p.sponsor);
    p.sponsorList = p.sponsorList.map(s => this.transformSponsorUrl(s));

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

    this.gameSessionService.transformSession(p, p.sessionBegin, p.sessionEnd);

    return p;
  }

  private transformStanding(p: Standing): Standing {
    p.sponsorLogo = p.sponsor
      ? `${this.config.imagehost}/${p.sponsor}`
      : `${this.config.basehref}assets/sponsor.svg`;

    p.sponsorTooltip = p.sponsorList.map(s => s.split('.').reverse().pop()?.toUpperCase()).join(' | ');
    p.sponsorList.forEach((s, i, a) => a[i] = `${this.config.imagehost}/${s}`);
    p.session = new TimeWindow(p.sessionBegin, p.sessionEnd);
    return p;
  }

  private transformSponsor<T extends { sponsorLogo: string, sponsor: string }>(p: T): T {
    p.sponsorLogo = this.transformSponsorUrl(p.sponsor);
    return p;
  }

  private transformSponsorUrl = (sponsor: string): string =>
    sponsor ? `${this.config.imagehost}/${sponsor}` : `${this.config.basehref}assets/sponsor.svg`;
}
