import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DateTime } from 'luxon';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { ApprovePlayerNameRequest, GetAppActiveChallengesResponse, GetAppActiveTeamsResponse, GetPlayersCsvExportResponse, GetPlayersCsvExportResponsePlayer, GetSiteOverviewStatsResponse, SendAnnouncement } from './admin.models';
import { PlayerMode } from './player-models';
import { GameCenterContext, GameCenterPracticeContext, GameCenterPracticeSessionStatus, GameCenterTeamsRequestArgs, GameCenterTeamsResults, GetGameCenterPracticeContextRequest } from '@/admin/components/game-center/game-center.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  async approvePlayerName(playerId: string, request: ApprovePlayerNameRequest) {
    return await firstValueFrom(this.http.put(this.apiUrl.build(`admin/players/${playerId}/name`), request));
  }

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

  async getPlayersExport(gameId: string, teamIds?: string[]): Promise<GetPlayersCsvExportResponsePlayer[]> {
    return firstValueFrom(this.http.get<GetPlayersCsvExportResponse>(this.apiUrl.build(`admin/games/${gameId}/players/export`, { gameId, teamIds })).pipe(
      map(res => {
        for (const player of res.players) {
          player.session.start = player.session.start ? DateTime.fromISO(player.session.start.toString()) : undefined;
          player.session.end = player.session.end ? DateTime.fromISO(player.session.end.toString()) : undefined;
        }

        return res.players;
      })
    ));
  }

  async getGameCenterContext(gameId: string): Promise<GameCenterContext> {
    return firstValueFrom(this.http.get<GameCenterContext>(this.apiUrl.build(`admin/games/${gameId}/game-center`)).pipe(
      tap(ctx => {
        ctx.executionWindow.start = DateTime.fromJSDate(new Date(ctx.executionWindow.start.toString()));
        ctx.executionWindow.end = DateTime.fromJSDate(new Date(ctx.executionWindow.end.toString()));
      })
    ));
  }

  async getGameCenterPracticeContext(gameId: string, args: GetGameCenterPracticeContextRequest): Promise<GameCenterPracticeContext> {
    return firstValueFrom(this.http.get<GameCenterPracticeContext>(this.apiUrl.build(`admin/games/${gameId}/game-center/practice`, args)));
  }

  async getGameCenterTeams(gameId: string, args: GameCenterTeamsRequestArgs): Promise<GameCenterTeamsResults> {
    return firstValueFrom(this.http.get<GameCenterTeamsResults>(this.apiUrl.build(`admin/games/${gameId}/game-center/teams`, { ...args, pageSize: 10000 })));
  }

  getOverallSiteStats(): Observable<GetSiteOverviewStatsResponse> {
    return this.http.get<GetSiteOverviewStatsResponse>(this.apiUrl.build("admin/stats"));
  }

  sendAnnouncement(announcement: SendAnnouncement): Observable<void> {
    return this.http.post<void>(this.apiUrl.build("admin/announce"), announcement);
  }
}
