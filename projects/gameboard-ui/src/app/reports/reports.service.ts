import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, map, of } from 'rxjs';
import { ReportViewModel, ReportKey, ReportResults, ReportTimeSpan } from './reports-models';
import { UriService } from '../services/uri.service';
import { SimpleEntity } from '../api/models';
import { FilesService } from '../services/files.service';
import { ChallengesReportComponent } from './components/reports/challenges-report/challenges-report.component';
import { PlayersReportComponent } from './components/reports/players-report/players-report.component';
import { LogService } from '../services/log.service';
import { SupportReportComponent } from './components/reports/support-report/support-report.component';
import { ApiUrlService } from '@/services/api-url.service';
import { EnrollmentReportComponent } from './components/reports/enrollment-report/enrollment-report.component';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private static reportComponentMap: { [reportKey: string]: any } = {
    'challenges-report': ChallengesReportComponent,
    'enrollment': EnrollmentReportComponent,
    'players-report': PlayersReportComponent,
    'support-report': SupportReportComponent
  };

  constructor(
    private apiUrlService: ApiUrlService,
    private filesService: FilesService,
    private http: HttpClient,
    private logService: LogService,
    private uriService: UriService
  ) { }

  async list(): Promise<ReportViewModel[]> {
    return await firstValueFrom(this.http.get<ReportViewModel[]>(this.apiUrlService.build("/reports")));
  }

  async get(key: string): Promise<ReportViewModel | null> {
    const reports = await this.list();
    return reports.find(r => r.key === key) || null;
  }

  getComponentForReport(key: ReportKey): any {
    if (ReportsService.reportComponentMap[key]) {
      return ReportsService.reportComponentMap[key];
    }

    this.logService.logError(`Can't resolve a component for report key "${key.toString()}".`);
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

  getSponsors(): Observable<SimpleEntity[]> {
    return this.http.get<SimpleEntity[]>(this.apiUrlService.build("/reports/parameter/sponsors"));
  }

  getTicketStatuses(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrlService.build("/reports/parameter/ticket-statuses")).pipe(map(statuses => statuses.sort()));
  }

  getTracks(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrlService.build("/reports/parameter/tracks"));
  }

  dateToQueryStringEncoded(date?: Date) {
    if (!date) return "";
    return `${(date.getMonth() + 1) % 12}-${date.getDate()}-${date.getFullYear()}`;
  }

  minutesToTimeSpan(minutes?: number): ReportTimeSpan {
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

  timespanToMinutes(timespan?: ReportTimeSpan): number {
    if (!timespan)
      return 0;

    return (timespan.days || 0) * 24 * 60 + (timespan.hours || 0) * 60 + (timespan.minutes || 0);
  }

  async openExport(reportKey: ReportKey, parameters: any) {
    const queryString = this.uriService.toQueryString(parameters);
    await this.filesService.downloadFileFrom(this.apiUrlService.build(`/reports/export/${reportKey.toString()}${queryString ? `?${queryString}` : ''}`), reportKey.toString(), "csv", "text/csv");
  }
}
