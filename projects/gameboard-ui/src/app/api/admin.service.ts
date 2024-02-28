import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { GetAppActiveChallengesResponse, GetSiteOverviewStatsResponse } from './admin.models';
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

        // response.specs = response.specs.concat(response.specs);
        // response.specs = response.specs.concat(response.specs);
        // response.specs = response.specs.concat(response.specs);
        // response.specs = response.specs.concat(response.specs);
        // response.specs = response.specs.concat(response.specs);

        return response;
      })
    );
  }

  getOverallSiteStats(): Observable<GetSiteOverviewStatsResponse> {
    return this.http.get<GetSiteOverviewStatsResponse>(this.apiUrl.build("admin/stats"));
  }
}
