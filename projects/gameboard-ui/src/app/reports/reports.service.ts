import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Report, ReportParameterOptions, ReportParameters } from './reports-models';
import { ConfigService } from '../utility/config.service';
import { UriService } from '../services/uri.service';
import { ChallengesReportArgs, ChallengesReportModel } from './components/challenges-report/challenges-report.models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private API_ROOT = '';

  constructor(
    private http: HttpClient,
    private uriService: UriService,
    config: ConfigService
  ) {
    this.API_ROOT = `${config.apphost}api`;
  }

  list(): Observable<Report[]> {
    return of([
      {
        id: "febd2574-8789-4eea-8466-00686b71706b",
        name: "Challenges Report",
        key: "challenges-report",
        description: "Understand the role a challenge played in its games and competitions, how attainable a full solve was, and more.",
        notableFields: [
          "Solve Times",
          "Scores",
          "Deploy vs. solve counts"
        ],
        parameters: [
          "Session Date Range",
          "Competition",
          "Track",
          "Game",
          "Challenge"
        ]
      },
      {
        id: "dd2a257f-1bbc-4f33-bf07-a6ae36bfad37",
        name: "Players Report",
        key: "players-report",
        description: "Get a better view of your players - how often they play, how they perform when they do, and which events they compete in",
        notableFields: [
          "Challenges Per Month",
          "Sponsor",
          "Lifetime Score"
        ],
        parameters: [
          "Sponsor",
          "Competition",
          "Track",
          "Game",
          "Challenge"
        ],
      },
    ]);
  }

  get(key: string): Observable<Report | undefined> {
    return this.list()
      .pipe(
        map(reports => reports.find(r => r.key === key)),
      );
  }

  getParameterOptions(reportKey: string, selectedParameters: ReportParameters): Observable<ReportParameterOptions> {
    const query = this.uriService.uriEncode(selectedParameters);

    return this.http.get<ReportParameterOptions>(`${this.API_ROOT}/reports/${reportKey}/parameter-options${query ? `?${query}` : ''}`);
  }

  getChallengesReport(args: ChallengesReportArgs): Observable<ChallengesReportModel> {
    const query = this.uriService.uriEncode(args);

    return this.http.get<ChallengesReportModel>(`${this.API_ROOT}/reports/challenges-report${query ? `?${query}` : ''}`);
  }
}
