import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ReportViewModel, ReportParameterOptions, ReportParameters } from './reports-models';
import { ConfigService } from '../utility/config.service';
import { UriService } from '../services/uri.service';
import { ChallengesReportArgs, ChallengesReportModel } from './components/challenges-report/challenges-report.models';
import { PlayersReportParameters, PlayersReportResults } from './components/players-report/players-report.models';
import { SimpleEntity } from '../api/models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly API_ROOT = `${this.config.apphost}api`;

  constructor(
    private http: HttpClient,
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

  getCompetitionOptions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_ROOT}/reports/parameter/competitions`);
  }

  getParameterOptions(reportKey: string, selectedParameters: ReportParameters): Observable<ReportParameterOptions> {
    const query = this.uriService.uriEncode(selectedParameters);

    return this.http.get<ReportParameterOptions>(`${this.API_ROOT}/reports/${reportKey}/parameter-options${query ? `?${query}` : ''}`);
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
}
