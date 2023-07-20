import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { ReportViewModel, ReportKey, ReportTimeSpan, ReportSponsor, ReportMetaData } from './reports-models';
import { PagingArgs, SimpleEntity } from '../api/models';
import { FilesService } from '../services/files.service';
import { LogService } from '../services/log.service';
import { ApiUrlService } from '@/services/api-url.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(
    private apiUrlService: ApiUrlService,
    private filesService: FilesService,
    private http: HttpClient,
    private logService: LogService
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

  applyDefaultPaging<T extends { pageNumber?: number; pageSize?: number }>(reportParameters: T): T {
    return { ...this.getDefaultPaging(), ...reportParameters };
  }

  getDefaultPaging(): PagingArgs {
    return {
      pageNumber: 0,
      pageSize: 5
    };
  }

  getReportMetaData(key: ReportKey): Observable<ReportMetaData> {
    return this.http.get<ReportMetaData>(this.apiUrlService.build("/reports/metaData", { reportKey: key }));
  }

  dateToQueryStringEncoded(date?: Date) {
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

  minutesToTimeSpan(minutes: number | undefined | null): ReportTimeSpan {
    if (!minutes)
      return { days: undefined, hours: undefined, minutes: undefined };

    const minutesInDay = 24 * 60;

    let remainingMinutes = minutes;
    const days = remainingMinutes / minutesInDay;
    remainingMinutes = remainingMinutes % minutesInDay;

    const hours = remainingMinutes / 60;
    remainingMinutes = remainingMinutes % 60;

    return {
      days: days || undefined,
      hours: hours || undefined,
      minutes: remainingMinutes
    };
  }

  timespanToMinutes(timespan: ReportTimeSpan | null | undefined): number {
    if (!timespan)
      return 0;

    return (timespan.days || 0) * 24 * 60 + (timespan.hours || 0) * 60 + (timespan.minutes || 0);
  }

  flattenMultiSelectValues(input?: string[]): string | undefined {
    if (!input)
      return undefined;

    return input.join(",") || undefined;
  }

  unflattenMultiSelectValues(input?: string): string[] {
    if (!input)
      return [];

    return input.split(",");
  }

  async openExport<T>(reportKey: ReportKey, parameters: T) {
    await this.filesService.downloadFileFrom(this.apiUrlService.build(`/reports/export/${reportKey.toString()}`, parameters), reportKey.toString(), "csv", "text/csv");
  }
}
