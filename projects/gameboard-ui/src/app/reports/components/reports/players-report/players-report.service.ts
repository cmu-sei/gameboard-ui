// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlayersReportFlatParameters, PlayersReportRecord, PlayersReportStatSummary } from './players-report.models';
import { ApiUrlService } from '@/services/api-url.service';
import { ReportResultsWithOverallStats } from '@/reports/reports-models';

@Injectable({ providedIn: 'root' })
export class PlayersReportService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  getReportData(parameters: PlayersReportFlatParameters) {
    return this.http.get<ReportResultsWithOverallStats<PlayersReportStatSummary, PlayersReportRecord>>(this.apiUrl.build("reports/players", parameters));
  }
}
