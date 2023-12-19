import { Injectable } from '@angular/core';
import { SupportReportFlatParameters, SupportReportRecord } from './support-report.models';
import { Observable, map } from 'rxjs';
import { ReportResults } from '../../../reports-models';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '@/services/api-url.service';
import { SupportService } from '@/api/support.service';

@Injectable({ providedIn: 'root' })
export class SupportReportService {

  constructor(
    private apiUri: ApiUrlService,
    private http: HttpClient,
    private supportService: SupportService) { }

  getReportData(args: SupportReportFlatParameters): Observable<ReportResults<SupportReportRecord>> {
    return this.http.get<ReportResults<SupportReportRecord>>(this.apiUri.build("/reports/support", args));
  }

  getTicketStatuses(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUri.build("/reports/parameter/ticket-statuses")).pipe(map(statuses => statuses.sort()));
  }

  getTicketLabels(): Observable<string[]> {
    return this.supportService.listLabels(null);
  }
}
