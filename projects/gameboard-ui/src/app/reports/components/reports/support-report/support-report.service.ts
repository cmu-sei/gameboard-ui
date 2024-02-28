import { Injectable } from '@angular/core';
import { SupportReportFlatParameters, SupportReportRecord, SupportReportStatSummary } from './support-report.models';
import { Observable, map } from 'rxjs';
import { ReportResults, ReportResultsWithOverallStats } from '../../../reports-models';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '@/services/api-url.service';
import { SupportService } from '@/api/support.service';

@Injectable({ providedIn: 'root' })
export class SupportReportService {

  constructor(
    private apiUri: ApiUrlService,
    private http: HttpClient,
    private supportService: SupportService) { }

  getReportData(args: SupportReportFlatParameters): Observable<ReportResultsWithOverallStats<SupportReportStatSummary, SupportReportRecord>> {
    return this.http.get<ReportResultsWithOverallStats<SupportReportStatSummary, SupportReportRecord>>(this.apiUri.build("/reports/support", args));
  }

  getTicketStatuses(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUri.build("/reports/parameter/ticket-statuses")).pipe(map(statuses => statuses.sort()));
  }

  getTicketLabels(): Observable<string[]> {
    return this.supportService.listLabels(null);
  }
}
