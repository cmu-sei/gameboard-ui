import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ReportViewModel, ReportParameterOptions, ReportParameters, ReportKey } from './reports-models';
import { ConfigService } from '../utility/config.service';
import { UriService } from '../services/uri.service';
import { ChallengesReportArgs, ChallengesReportModel } from './components/challenges-report/challenges-report.models';
import { PlayersReportParameters, PlayersReportResults } from './components/players-report/players-report.models';
import { SimpleEntity } from '../api/models';
import { WindowService } from '../services/window.service';
import { FilesService } from '../services/files.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly API_ROOT = `${this.config.apphost}api`;

  constructor(
    private filesService: FilesService,
    private http: HttpClient,
    private uriService: UriService,
    private config: ConfigService,
    private windowService: WindowService,
  ) { }

  async list(): Promise<ReportViewModel[]> {
    return await firstValueFrom(this.http.get<ReportViewModel[]>(`${this.API_ROOT}/reports`));
  }

  async get(key: string): Promise<ReportViewModel | null> {
    const reports = await this.list();
    return reports.find(r => r.key === key) || null;
  }

  getCompetitionOptions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_ROOT}/reports/parameter/competitions`);
  }

  getChallengesReport(args: ChallengesReportArgs): Observable<ChallengesReportModel> {
    const query = this.uriService.uriEncode(args);

    return this.http.get<ChallengesReportModel>(`${this.API_ROOT}/reports/challenges-report${query ? `?${query}` : ''}`);
  }

  getPlayersReport(args: PlayersReportParameters): Observable<PlayersReportResults> {
    const query = this.uriService.uriEncode(args);

    return this.http.get<PlayersReportResults>(`${this.API_ROOT}/reports/players-report?${query ? `?${query}` : ''}`);
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
    console.log(`${this.API_ROOT}/reports/export/${reportKey.toString()}${queryString ? `?${queryString}` : ''}`);
    await this.filesService.downloadFileFrom(`${this.API_ROOT}/reports/export/${reportKey.toString()}${queryString ? `?${queryString}` : ''}`, reportKey.toString(), "csv", "text/csv")
  }
}
