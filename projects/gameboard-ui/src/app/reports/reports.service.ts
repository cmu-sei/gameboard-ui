import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { ReportViewModel, ReportKey, ReportSponsor, ReportMetaData } from './reports-models';
import { SimpleEntity } from '../api/models';
import { FilesService } from '../services/files.service';
import { ApiUrlService } from '@/services/api-url.service';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(
    private apiUrlService: ApiUrlService,
    private filesService: FilesService,
    private http: HttpClient
  ) { }

  async list(): Promise<ReportViewModel[]> {
    return await firstValueFrom(this.http.get<ReportViewModel[]>(this.apiUrlService.build("/reports")));
  }

  async get(key: string): Promise<ReportViewModel | null> {
    const reports = await this.list();
    return reports.find(r => r.key === key) || null;
  }

  getChallengeSpecs(gameId?: string): Observable<SimpleEntity[]> {
    return this.http.get<SimpleEntity[]>(this.apiUrlService.build(`/reports/parameter/challenge-specs/${gameId || ''}`));
  }

  getChallengeTags(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrlService.build("/reports/parameter/challenge-tags"));
  }

  getGames(): Observable<SimpleEntity[]> {
    return this.http.get<SimpleEntity[]>(this.apiUrlService.build("/reports/parameter/games"));
  }

  getSeasons(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrlService.build("/reports/parameter/seasons"));
  }

  getSeries(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrlService.build("/reports/parameter/series"));
  }

  getSponsors(): Observable<ReportSponsor[]> {
    return this.http.get<ReportSponsor[]>(this.apiUrlService.build("/reports/parameter/sponsors"));
  }

  getTracks(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrlService.build("/reports/parameter/tracks"));
  }

  getReportMetaData(key: ReportKey): Observable<ReportMetaData> {
    return this.http.get<ReportMetaData>(this.apiUrlService.build("/reports/metaData", { reportKey: key })).pipe(map(m => {
      m.runAt = DateTime.fromISO(m.runAt.toString());
      return m;
    }));
  }

  dateToQueryStringEncoded(date: Date | null | undefined) {
    if (!date) return undefined;
    // this is prettier in the qs, but the default API-side modelbinder can't bind it to a date
    // return `${(date.getMonth() + 1) % 12}-${date.getDate()}-${date.getFullYear()}`;
    return date.toLocaleDateString();
  }

  queryStringEncodedDateToDate(dateString?: string): Date | undefined {
    if (!dateString)
      return undefined;

    return new Date(Date.parse(dateString));
  }

  async openExport<T>(reportKey: ReportKey, parameters: T) {
    await this.filesService.downloadFileFrom(this.apiUrlService.build(`/reports/export/${reportKey.toString()}`, parameters), reportKey.toString(), "csv", "text/csv");
  }
}
