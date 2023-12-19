import { Injectable } from '@angular/core';
import { PlayersReportFlatParameters, PlayersReportRecord, PlayersReportStatSummary } from './players-report.models';
import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';
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
