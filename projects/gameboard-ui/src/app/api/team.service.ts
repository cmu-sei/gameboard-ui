import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, firstValueFrom, from, map, tap } from "rxjs";
import { SessionEndRequest, SessionExtendRequest, Team, TeamSummary } from "./player-models";
import { AdminEnrollTeamRequest, AdminEnrollTeamResponse, AdminExtendTeamSessionResponse, TeamSessionResetType } from "./teams.models";
import { ApiUrlService } from "@/services/api-url.service";
import { unique } from "../../tools/tools";
import { GamePlayState } from "./game-models";

@Injectable({ providedIn: 'root' })
export class TeamService {
    private _playerSessionChanged$ = new Subject<string>();
    public playerSessionChanged$ = this._playerSessionChanged$.asObservable();

    private _teamSessionExtended$ = new Subject<string[]>();
    public teamSessionExtended$ = this._teamSessionExtended$.asObservable();

    private _teamSessionsChanged$ = new Subject<string[]>();
    public teamSessionsChanged$ = this._teamSessionsChanged$.asObservable();

    private _teamSessionEndedManually$ = new Subject<string>();
    public teamSessionEndedManually$ = this._teamSessionEndedManually$.asObservable();

    private _teamSessionReset$ = new Subject<string>();
    public teamSessionReset$ = this._teamSessionReset$.asObservable();

    constructor(
        private apiUrl: ApiUrlService,
        private http: HttpClient) { }

    adminEnroll(request: AdminEnrollTeamRequest): Observable<AdminEnrollTeamResponse> {
        request.userIds = unique(request.userIds);
        return this.http.post<AdminEnrollTeamResponse>(this.apiUrl.build("admin/team"), request);
    }

    adminExtendSession(request: { teamIds: string[], extensionDurationInMinutes: number }) {
        return this.http.put<AdminExtendTeamSessionResponse>(this.apiUrl.build("admin/team/session"), request).pipe(
            tap(teamSessions => this._teamSessionsChanged$.next(teamSessions.teams.map(t => t.id))),
            tap(teamSessions => this._teamSessionExtended$.next(teamSessions.teams.map(t => t.id)))
        );
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

    public async extendSession(model: SessionExtendRequest): Promise<void> {
        await this.updateSession(model);
        this._teamSessionExtended$.next([model.teamId]);
    }

    public resetSession(request: { teamId: string, resetType?: TeamSessionResetType }): Observable<void> {
        return this.http.put<void>(this.apiUrl.build(`/team/${request.teamId}/session`), request).pipe(
            tap(_ => this._teamSessionReset$.next(request.teamId))
        );
    }

    public startSession(request: { teamIds: string[] }) {
        return firstValueFrom(this.http.post<any>(this.apiUrl.build("/team/session"), request));
    }

    private async updateSession(request: SessionExtendRequest | SessionEndRequest): Promise<void> {
        await firstValueFrom(this.http.put<any>(this.apiUrl.build("/team/session"), request));
        this._playerSessionChanged$.next(request.teamId);
        this._teamSessionsChanged$.next([request.teamId]);
    }
}
