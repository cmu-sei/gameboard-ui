import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, firstValueFrom, map, tap } from "rxjs";
import { SessionEndRequest, SessionExtendRequest, Team, TeamSummary } from "./player-models";
import { AddToTeamResponse, AdminEnrollTeamRequest, AdminEnrollTeamResponse, AdminExtendTeamSessionResponse, AdvanceTeamsRequest, RemoveFromTeamResponse, TeamSessionResetType, TeamSessionUpdate } from "./teams.models";
import { ApiUrlService } from "@/services/api-url.service";
import { unique } from "../../tools/tools";
import { GamePlayState } from "./game-models";
import { ApiDateTimeService } from "@/services/api-date-time.service";

@Injectable({ providedIn: 'root' })
export class TeamService {
    private _playerSessionChanged$ = new Subject<string>();
    public playerSessionChanged$ = this._playerSessionChanged$.asObservable();

    private _teamRosterChanged$ = new Subject<string>();
    public teamRosterChanged$ = this._teamRosterChanged$.asObservable();

    private _teamSessionExtended$ = new Subject<TeamSessionUpdate[]>();
    public teamSessionExtended$ = this._teamSessionExtended$.asObservable();

    private _teamSessionsChanged$ = new Subject<TeamSessionUpdate[]>();
    public teamSessionsChanged$ = this._teamSessionsChanged$.asObservable();

    private _teamSessionEndedManually$ = new Subject<string>();
    public teamSessionEndedManually$ = this._teamSessionEndedManually$.asObservable();

    private _teamSessionReset$ = new Subject<string>();
    public teamSessionReset$ = this._teamSessionReset$.asObservable();

    constructor(
        private apiDateTimeService: ApiDateTimeService,
        private apiUrl: ApiUrlService,
        private http: HttpClient) { }

    async adminEnroll(request: AdminEnrollTeamRequest): Promise<AdminEnrollTeamResponse> {
        request.userIds = unique(request.userIds);

        const result = await firstValueFrom(this.http.post<AdminEnrollTeamResponse>(this.apiUrl.build("admin/team"), request));
        this._teamRosterChanged$.next(result.id);
        return result;
    }

    adminExtendSession(request: { teamIds: string[], extensionDurationInMinutes: number }) {
        return this.http.put<AdminExtendTeamSessionResponse>(this.apiUrl.build("admin/team/session"), request).pipe(
            map(r => {
                for (const team of r.teams) {
                    team.sessionEnd = this.apiDateTimeService.toDateTime(team.sessionEnd.toString()) || team.sessionEnd;
                }

                return r;
            }),
            tap(teamSessions => this._teamSessionsChanged$.next(teamSessions.teams.map(t => ({ id: t.id, sessionEndsAt: t.sessionEnd.toMillis() })))),
            tap(teamSessions => this._teamSessionExtended$.next(teamSessions.teams.map(t => ({ id: t.id, sessionEndsAt: t.sessionEnd.toMillis() }))))
        );
    }

    async addToTeam(request: { teamId: string; userId: string }): Promise<AddToTeamResponse> {
        const result = await firstValueFrom(this.http.put<AddToTeamResponse>(this.apiUrl.build(`team/${request.teamId}/players`), request));
        this._teamRosterChanged$.next(request.teamId);
        return result;
    }

    public async advance(request: AdvanceTeamsRequest) {
        return firstValueFrom(this.http.post(this.apiUrl.build("team/advance"), request));
    }

    unenroll(request: { teamId: string, resetType?: TeamSessionResetType }) {
        return this.http.post(this.apiUrl.build(`team/${request.teamId}/session`), {
            resetType: request.resetType || "unenrollAndArchiveChallenges"
        });
    }

    public get(teamId: string) {
        return this.http.get<Team>(this.apiUrl.build(`/team/${teamId}`));
    }

    public getMailMetadata(gameId: string) {
        return this.http.get<TeamSummary[]>(this.apiUrl.build(`/teams/${gameId}`));
    }

    public getGamePlayState(teamId: string): Observable<GamePlayState> {
        return this.http.get<GamePlayState>(this.apiUrl.build(`team/${teamId}/play-state`));
    }

    public async removePlayer(playerId: string, teamId: string): Promise<RemoveFromTeamResponse> {
        const result = await firstValueFrom(this.http.delete<RemoveFromTeamResponse>(this.apiUrl.build(`team/${teamId}/players/${playerId}`)));
        this._teamRosterChanged$.next(result.teamId);
        return result;
    }

    public search(teamIds: string[]) {
        if (!teamIds?.length) {
            throw new Error("Can't retrieve teams - no ids specified.");
        }

        return this.http.get<Team[]>(this.apiUrl.build(`admin/team/search?ids=${teamIds.join(",")}`)).pipe(
            map(teams => {
                for (const team of teams) {
                    team.sessionBegin = new Date(team.sessionBegin);
                    team.sessionEnd = new Date(team.sessionEnd);
                }

                return teams;
            })
        );
    }

    public async endSession(request: SessionEndRequest) {
        // endSession and extendSession invoke the same endpoint, with
        // "end" having no sessionEnd value
        await this.updateSession(request);
        this._teamSessionEndedManually$.next(request.teamId);
    }

    public async extendSession(model: SessionExtendRequest): Promise<TeamSessionUpdate> {
        const result = await this.updateSession(model);
        await this.updateSession(model);
        this._teamSessionExtended$.next([result]);

        return result;
    }

    public resetSession(request: { teamId: string, resetType?: TeamSessionResetType }): Observable<void> {
        return this.http.put<void>(this.apiUrl.build(`/team/${request.teamId}/session`), request).pipe(
            tap(_ => this._teamSessionReset$.next(request.teamId))
        );
    }

    public startSession(request: { teamIds: string[] }) {
        return firstValueFrom(this.http.post<any>(this.apiUrl.build("/team/session"), request));
    }

    private async updateSession(request: SessionExtendRequest | SessionEndRequest): Promise<TeamSessionUpdate> {
        const result = await firstValueFrom(this.http.put<TeamSessionUpdate>(this.apiUrl.build("/team/session"), request));
        this._playerSessionChanged$.next(request.teamId);
        this._teamSessionsChanged$.next([result]);

        return result;
    }
}
