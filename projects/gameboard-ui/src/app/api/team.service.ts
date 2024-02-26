import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, tap } from "rxjs";
import { SessionEndRequest, SessionExtendRequest, Team } from "./player-models";
import { AdminExtendTeamSessionResponse, ResetTeamSessionRequest } from "./teams.models";
import { ApiUrlService } from "@/services/api-url.service";

@Injectable({ providedIn: 'root' })
export class TeamService {
    private _playerSessionChanged$ = new Subject<string>();
    public playerSessionChanged$ = this._playerSessionChanged$.asObservable();

    private _teamSessionsChanged$ = new Subject<string[]>();
    public teamSessionsChanged$ = this._teamSessionsChanged$.asObservable();

    private _teamSessionReset$ = new Subject<string>();
    public teamSessionReset$ = this._teamSessionReset$.asObservable();

    constructor(
        private apiUrl: ApiUrlService,
        private http: HttpClient) { }

    adminExtendSession(request: { teamIds: string[], extensionDurationInMinutes: number }) {
        return this.http.put<AdminExtendTeamSessionResponse>(this.apiUrl.build("admin/team/session"), request).pipe(
            tap(teamSessions => this._teamSessionsChanged$.next(teamSessions.teams.map(t => t.id)))
        );
    }

    public get(teamId: string) {
        return this.http.get<Team>(this.apiUrl.build(`/team/${teamId}`));
    }

    public search(teamIds: string[]) {
        if (!teamIds?.length) {
            throw new Error("Can't retrieve teams - no ids specified.");
        }

        return this.http.get<Team[]>(this.apiUrl.build(`admin/team/search?ids=${teamIds.join(",")}`));
    }

    public endSession(request: SessionEndRequest) {
        // endSession and extendSession invoke the same endpoint, with
        // "end" having no sessionEnd value
        return this.updateSession(request);
    }

    public extendSession(model: SessionExtendRequest): Observable<void> {
        return this.updateSession(model);
    }

    private updateSession(request: SessionExtendRequest | SessionEndRequest): Observable<void> {
        return this.http.put<any>(this.apiUrl.build("/team/session"), request).pipe(
            tap(_ => this._teamSessionsChanged$.next([request.teamId])),
            tap(_ => this._playerSessionChanged$.next(request.teamId)),
        );
    }

    public resetSession(teamId: string, request: ResetTeamSessionRequest): Observable<void> {
        return this.http.post<void>(this.apiUrl.build(`/team/${teamId}/session`), request).pipe(
            tap(_ => this._teamSessionReset$.next(teamId))
        );
    }
}
