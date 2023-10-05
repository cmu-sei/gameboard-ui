import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Team } from "./player-models";
import { ResetTeamSessionRequest } from "./teams.models";
import { Observable, Subject, tap } from "rxjs";
import { ApiUrlService } from "@/services/api-url.service";

@Injectable({ providedIn: 'root' })
export class TeamService {
    private _teamSessionReset$ = new Subject<string>();
    public teamSessionReset$ = this._teamSessionReset$.asObservable();

    constructor(
        private apiUrl: ApiUrlService,
        private http: HttpClient) { }

    public get(teamId: string) {
        return this.http.get<Team>(this.apiUrl.build(`/team/${teamId}`));
    }

    public resetSession(teamId: string, request: ResetTeamSessionRequest): Observable<void> {
        return this.http.post<void>(this.apiUrl.build(`${teamId}/session`), request).pipe(
            tap(_ => this._teamSessionReset$.next(teamId))
        );
    }
}
