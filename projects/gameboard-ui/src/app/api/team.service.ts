import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LogService } from "../services/log.service";
import { ConfigService } from "../utility/config.service";
import { Team } from "./player-models";

@Injectable({ providedIn: 'root' })
export class TeamService {
    private readonly API_ROOT;

    constructor(private http: HttpClient, config: ConfigService, logService: LogService) {
        this.API_ROOT = config.apphost + 'api';
    }

    public get(teamId: string) {
        return this.http.get<Team>(`${this.API_ROOT}/team/${teamId}`);
    }
}
