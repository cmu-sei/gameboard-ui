// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DateTime } from 'luxon';
import { firstValueFrom, map } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { SiteUsageReport, SiteUsageReportChallenge, SiteUsageReportFlatParameters, SiteUsageReportPlayer, SiteUsageReportPlayersModalParameters, SiteUsageReportSponsor } from './site-usage-report.models';
import { PagedArray, PagingArgs } from '@/api/models';

@Injectable({ providedIn: 'root' })
export class SiteUsageReportService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  async get(parameters: SiteUsageReportFlatParameters): Promise<SiteUsageReport> {
    return await firstValueFrom(this.http.get<SiteUsageReport>(this.apiUrl.build("reports/site-usage", parameters)));
  }

  async getChallenges(parameters: SiteUsageReportFlatParameters, pagingArgs?: PagingArgs) {
    return await firstValueFrom(this.http.get<PagedArray<SiteUsageReportChallenge>>(this.apiUrl.build("reports/site-usage/challenges", { ...parameters, ...pagingArgs })));
  }

  async getPlayers(reportParameters: SiteUsageReportFlatParameters, playersParameters?: SiteUsageReportPlayersModalParameters, pagingArgs?: PagingArgs) {
    return await firstValueFrom(this.http.get<PagedArray<SiteUsageReportPlayer>>(this.apiUrl.build("reports/site-usage/players", { ...reportParameters, ...playersParameters, ...pagingArgs })).pipe(map(results => {
      for (const player of results.items) {
        player.lastActive = DateTime.fromISO(player.lastActive.toString());
      }

      return results;
    })));
  }

  async getSponsors(parameters: SiteUsageReportFlatParameters): Promise<SiteUsageReportSponsor[]> {
    return await firstValueFrom(this.http.get<SiteUsageReportSponsor[]>(this.apiUrl.build("reports/site-usage/sponsors", parameters)));
  }
}
