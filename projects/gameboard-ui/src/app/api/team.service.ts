import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SessionEndRequest, SessionExtendRequest, Team } from "./player-models";
import { ResetTeamSessionRequest } from "./teams.models";
import { Observable, Subject, tap } from "rxjs";
import { ApiUrlService } from "@/services/api-url.service";

@Injectable({ providedIn: 'root' })
export class TeamService {
    private _playerSessionChanged$ = new Subject<string>();
    public playerSessionChanged$ = this._playerSessionChanged$.asObservable();

    private _teamSessionChanged$ = new Subject<string>();
    public teamSessionChanged$ = this._teamSessionChanged$.asObservable();

    private _teamSessionReset$ = new Subject<string>();
    public teamSessionReset$ = this._teamSessionReset$.asObservable();

    constructor(
        private apiUrl: ApiUrlService,
        private http: HttpClient) { }

    public get(teamId: string) {
        return this.http.get<Team>(this.apiUrl.build(`/team/${teamId}`));
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
            tap(_ => this._teamSessionChanged$.next(request.teamId)),
            tap(_ => this._playerSessionChanged$.next(request.teamId)),
        );
    }

    public resetSession(teamId: string, request: ResetTeamSessionRequest): Observable<void> {
        return this.http.post<void>(this.apiUrl.build(`/team/${teamId}/session`), request).pipe(
            tap(_ => this._teamSessionReset$.next(teamId))
        );
    }
}
