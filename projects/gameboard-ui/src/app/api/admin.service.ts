import { ApiUrlService } from '@/services/api-url.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetSiteOverviewStatsResponse } from './admin.models';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  getOverallSiteStats(): Observable<GetSiteOverviewStatsResponse> {
    return this.http.get<GetSiteOverviewStatsResponse>(this.apiUrl.build("admin/stats"));
  }
}
