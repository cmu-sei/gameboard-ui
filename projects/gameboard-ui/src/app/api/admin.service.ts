import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { GetAppActiveChallengesResponse, GetSiteOverviewStatsResponse } from './admin.models';
import { PlayerMode } from './player-models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  getActiveChallenges(mode: PlayerMode) {
    return this.http.get<GetAppActiveChallengesResponse>(this.apiUrl.build(`admin/active-challenges?playerMode=${mode.toLowerCase()}`));
  }

  getOverallSiteStats(): Observable<GetSiteOverviewStatsResponse> {
    return this.http.get<GetSiteOverviewStatsResponse>(this.apiUrl.build("admin/stats"));
  }
}
