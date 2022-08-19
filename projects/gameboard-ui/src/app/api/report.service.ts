// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { Challenge } from './board-models';
import { FeedbackStats } from './feedback-models';
import { UserReport, PlayerReport, SponsorReport, GameSponsorReport, ChallengeReport, ChallengeDetailReport, SeasonReport } from './report-models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public userReport(): Observable<UserReport> {
    return this.http.get<UserReport>(`${this.url}/report/userstats`);
  }

  public exportUserStats(): void {
    this.http.get(`${this.url}/report/exportuserstats`, { responseType: 'arraybuffer' })
      .subscribe(response => {
        const name: string = 'user-stats-report-' + this.timestamp() + '.csv';
        this.downloadFile(response, name, 'application/ms-excel');
      });
  }

  public playerReport(): Observable<PlayerReport> {
    return this.http.get<PlayerReport>(`${this.url}/report/playerstats`);
  }

  public exportPlayerStats(): void {
    this.http.get(`${this.url}/report/exportplayerstats/`, { responseType: 'arraybuffer' })
      .subscribe(response => {
        const name: string = 'player-stats-report-' + this.timestamp() + '.csv';
        this.downloadFile(response, name, 'application/ms-excel');
      });
  }

  public sponsorReport(): Observable<SponsorReport> {
    return this.http.get<SponsorReport>(`${this.url}/report/sponsorstats`);
  }

  public exportSponsorReport(id: string): void {
    this.http.get(`${this.url}/report/exportsponsorstats/${id}`, { responseType: 'arraybuffer' })
      .subscribe(response => {
        const name: string = 'sponsor-report-' + this.timestamp() + '.csv';
        this.downloadFile(response, name, 'application/ms-excel');
      });
  }

  public gameSponsorReport(id: string): Observable<GameSponsorReport> {
    return this.http.get<GameSponsorReport>(`${this.url}/report/gamesponsorstats/${id}`);
  }

  public exportGameSponsorReport(id: string): void {
    this.http.get(`${this.url}/report/exportgamesponsorstats/${id}`, { responseType: 'arraybuffer' })
      .subscribe(response => {
        const name: string = 'board-report-' + this.timestamp() + '.csv';
        this.downloadFile(response, name, 'application/ms-excel');
      });
  }

  public challengeReport(id: string): Observable<ChallengeReport> {
    return this.http.get<ChallengeReport>(`${this.url}/report/challengestats/${id}`);
  }

  public challengeDetails(id: string): Observable<ChallengeDetailReport> {
    return this.http.get<ChallengeDetailReport>(`${this.url}/report/challengedetails/${id}`);
  }

  public exportChallengeStats(id: string): void {
    this.http.get(`${this.url}/report/exportchallengestats/${id}`, { responseType: 'arraybuffer' })
      .subscribe(response => {
          const name: string = 'challenge-statistics-report-' + this.timestamp() + '.csv';
          this.downloadFile(response, name, 'application/ms-excel');
      });
  }

  public exportChallengeDetails(id: string): void {
    this.http.get(`${this.url}/report/exportchallengedetails/${id}`, { responseType: 'arraybuffer' })
      .subscribe(response => {
        const name: string = 'challenge-details-report-' + this.timestamp() + '.csv';
        this.downloadFile(response, name, 'application/ms-excel');
      });
  }

  public exportFeedbackDetails(params: any, exportName: string): void {
    this.http.get(`${this.url}/report/exportfeedbackdetails`, { responseType: 'arraybuffer', params: params })
      .subscribe(response => {
        const name: string = exportName + this.timestamp() + '.csv';
        this.downloadFile(response, name, 'application/ms-excel');
      });
  }
  
  public exportFeedbackStats(params: any, exportName: string): void {
    this.http.get(`${this.url}/report/exportfeedbackstats`, { responseType: 'arraybuffer', params: params })
      .subscribe(response => {
        const name: string = exportName + this.timestamp() + '.csv';
        this.downloadFile(response, name, 'application/ms-excel');
      });
  }

  public feedbackStats(params: any): Observable<FeedbackStats> {
    return this.http.get<FeedbackStats>(`${this.url}/report/feedbackstats/`, { params: params });
  }

  public supportDays(params: any): Observable<any> {
    return this.http.get<any>(`${this.url}/report/supportdaystats/`, { params: params });
  }

  public supportLabels(params: any): Observable<any> {
    return this.http.get<any>(`${this.url}/report/supportlabelstats/`, { params: params });
  }

  public supportChallenges(params: any): Observable<any> {
    return this.http.get<any>(`${this.url}/report/supportchallengestats/`, { params: params });
  }

  public seasonReport(): Observable<any> {
    return this.http.get<SeasonReport>(`${this.url}/report/seasonstats`);
  }

  public exportSeasonStats(): void {
    this.http.get(`${this.url}/report/exportseasonstats/`, { responseType: 'arraybuffer' })
      .subscribe(response => {
        const name: string = 'season-stats-report-' + this.timestamp() + '.csv';
        this.downloadFile(response, name, 'application/ms-excel');
      });
  }

  private downloadFile(data: any, name: string, type: string) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  private timestamp(): string {
    const date: Date = new Date();
    const month: number = date.getUTCMonth() + 1;
    const day: number = date.getUTCDate();
    const year: number = date.getUTCFullYear();
    const hours: number = date.getUTCHours();
    const minutes: number = date.getUTCMinutes();
    const seconds: number = date.getUTCSeconds();

    return year + '-' + month + '-' + day + '-' + hours + minutes + seconds;
  }

  public getSponsorLogoUrl(logo: string): string {
    const logoUrl = logo
      ? `${this.config.imagehost}/${logo}`
      : `${this.config.basehref}assets/sponsor.svg`
      ;
    return logoUrl;
  }
}
