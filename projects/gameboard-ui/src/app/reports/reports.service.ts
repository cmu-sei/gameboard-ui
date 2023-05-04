import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ReportViewModel, ReportKey, ReportResults } from './reports-models';
import { ConfigService } from '../utility/config.service';
import { UriService } from '../services/uri.service';
import { ChallengesReportArgs, ChallengesReportModel } from './components/reports/challenges-report/challenges-report.models';
import { PlayersReportParameters, PlayersReportResults } from './components/reports/players-report/players-report.models';
import { SimpleEntity } from '../api/models';
import { FilesService } from '../services/files.service';
import { ChallengesReportComponent } from './components/reports/challenges-report/challenges-report.component';
import { PlayersReportComponent } from './components/reports/players-report/players-report.component';
import { LogService } from '../services/log.service';
import { SupportReportComponent } from './components/reports/support-report/support-report.component';
import { SupportReportParameters, SupportReportRecord } from './components/reports/support-report/support-report.models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly API_ROOT = `${this.config.apphost}api`;

  private static reportComponentMap: { [reportKey: string]: any } = {
    'challenges-report': ChallengesReportComponent,
    'players-report': PlayersReportComponent,
    'support-report': SupportReportComponent
  };

  constructor(
    private filesService: FilesService,
    private http: HttpClient,
    private logService: LogService,
    private uriService: UriService,
    private config: ConfigService
  ) { }

  async list(): Promise<ReportViewModel[]> {
    return await firstValueFrom(this.http.get<ReportViewModel[]>(`${this.API_ROOT}/reports`));
  }

  async get(key: string): Promise<ReportViewModel | null> {
    const reports = await this.list();
    return reports.find(r => r.key === key) || null;
  }

  getComponentForReport(key: ReportKey): any {
    if (ReportsService.reportComponentMap[key]) {
      return ReportsService.reportComponentMap[key];
    }

    this.logService.logError(`Can't resolve a component for report key "${key.toString()}".`)
  }

  getCompetitionOptions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_ROOT}/reports/parameter/competitions`);
  }

  getChallengesReport(args: ChallengesReportArgs): Observable<ChallengesReportModel> {
    const query = this.uriService.toQueryString(args);

    return this.http.get<ChallengesReportModel>(`${this.API_ROOT}/reports/challenges-report${query}`);
  }

  getPlayersReport(args?: PlayersReportParameters): Observable<PlayersReportResults> {
    const query = this.uriService.toQueryString(args);
    return this.http.get<PlayersReportResults>(`${this.API_ROOT}/reports/players-report?${query}`);
  }

  getSupportReport(args: SupportReportParameters): Observable<ReportResults<SupportReportRecord>> {
    const query = this.uriService.toQueryString(args);
    return this.http.get<ReportResults<SupportReportRecord>>(`${this.API_ROOT}/reports/support-report${query}`);
  }

  getChallengeSpecOptions(gameId?: string): Observable<SimpleEntity[]> {
    return this.http.get<SimpleEntity[]>(`${this.API_ROOT}/reports/parameter/challenge-specs/${gameId || ''}`);
  }

  getGameOptions(): Observable<SimpleEntity[]> {
    return this.http.get<SimpleEntity[]>(`${this.API_ROOT}/reports/parameter/games`);
  }

  getTrackOptions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_ROOT}/reports/parameter/tracks`);
  }

  async openExport(reportKey: ReportKey, parameters: any) {
    const queryString = this.uriService.toQueryString(parameters);
    await this.filesService.downloadFileFrom(`${this.API_ROOT}/reports/export/${reportKey.toString()}${queryString ? `?${queryString}` : ''}`, reportKey.toString(), "csv", "text/csv")
  }
}
