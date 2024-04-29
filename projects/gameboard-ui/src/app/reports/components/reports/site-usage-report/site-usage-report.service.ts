import { Injectable } from '@angular/core';
import { SiteUsageReport, SiteUsageReportFlatParameters } from './site-usage-report.models';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '@/services/api-url.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SiteUsageReportService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  async get(parameters: SiteUsageReportFlatParameters): Promise<SiteUsageReport> {
    return await firstValueFrom(this.http.get<SiteUsageReport>(this.apiUrl.build("reports/site-usage", parameters)));
  }
}
