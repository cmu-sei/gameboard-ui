import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { GameCenterContext, GameCenterTeamsResults, GetAppActiveChallengesResponse, GetAppActiveTeamsResponse, GetSiteOverviewStatsResponse, SendAnnouncement } from './admin.models';
import { PlayerMode } from './player-models';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  getActiveChallenges(mode: PlayerMode) {
    return this.http.get<GetAppActiveChallengesResponse>(this.apiUrl.build(`admin/active-challenges?playerMode=${mode.toLowerCase()}`)).pipe(
      map(response => {
        for (const spec of response.specs) {
          for (const challenge of spec.challenges) {
            challenge.startedAt = DateTime.fromISO(challenge.startedAt.toString());
            challenge.team.session.start = DateTime.fromISO(challenge.team.session.start.toString());
            challenge.team.session.end = DateTime.fromISO(challenge.team.session.end.toString());
          }
        }

        return response;
      })
    );
  }

  getActiveTeams(): Observable<GetAppActiveTeamsResponse> {
    return this.http.get<GetAppActiveTeamsResponse>(this.apiUrl.build("admin/active-teams")).pipe(
      tap(response => {
        for (let team of response.teams) {
          team.session.start = DateTime.fromISO(team.session.start.toString());
          team.session.end = DateTime.fromISO(team.session.end.toString());
        }
      })
    );
  }

  async getGameCenterContext(gameId: string): Promise<GameCenterContext> {
    return firstValueFrom(this.http.get<GameCenterContext>(this.apiUrl.build(`admin/games/${gameId}/game-center`)).pipe(
      tap(ctx => {
        ctx.executionWindow.start = DateTime.fromJSDate(new Date(ctx.executionWindow.start.toString()));
        ctx.executionWindow.end = DateTime.fromJSDate(new Date(ctx.executionWindow.end.toString()));
      })
    ));
  }

  async getGameCenterTeams(gameId: string): Promise<GameCenterTeamsResults> {
    return firstValueFrom(this.http.get<GameCenterTeamsResults>(this.apiUrl.build(`admin/games/${gameId}/game-center/teams`)).pipe(
      tap(results => {
        for (const team of results.teams.items) {
          if (team.registeredOn)
            team.registeredOn = DateTime.fromJSDate(new Date(team.registeredOn?.toString()));
        }
      })
    ));
  }

  getOverallSiteStats(): Observable<GetSiteOverviewStatsResponse> {
    return this.http.get<GetSiteOverviewStatsResponse>(this.apiUrl.build("admin/stats"));
  }

  sendAnnouncement(announcement: SendAnnouncement): Observable<void> {
    return this.http.post<void>(this.apiUrl.build("admin/announce"), announcement);
  }
}
