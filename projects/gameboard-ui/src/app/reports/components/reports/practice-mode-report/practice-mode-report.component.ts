// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, resource } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { PracticeModeReportByChallengeRecord, PracticeModeReportGrouping, PracticeModeReportFlatParameters, PracticeModeReportOverallStats } from './practice-mode-report.models';
import { ReportKey, ReportResults, ReportSponsor } from '@/reports/reports-models';
import { SimpleEntity } from '@/api/models';
import { ReportComponentBase } from '../report-base.component';
import { PracticeModeReportService } from '@/reports/components/reports/practice-mode-report/practice-mode-report.service';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';
import { PracticeService } from '@/services/practice.service';

@Component({
  selector: 'app-practice-mode-report',
  templateUrl: './practice-mode-report.component.html',
  styleUrls: ['./practice-mode-report.component.scss'],
  standalone: false
})
export class PracticeModeReportComponent
  extends ReportComponentBase<PracticeModeReportFlatParameters> {
  private readonly practiceService = inject(PracticeService);

  protected overallStats: ReportSummaryStat[] = [];
  protected games$: Observable<SimpleEntity[]> = this.reportsService.getGames();
  protected seasons$: Observable<string[]> = this.reportsService.getSeasons();
  protected series$: Observable<string[]> = this.reportsService.getSeries();
  protected sponsors$: Observable<ReportSponsor[]> = this.reportsService.getSponsors();
  protected tracks$: Observable<string[]> = this.reportsService.getTracks();
  protected byChallengeResults$?: Observable<ReportResults<PracticeModeReportByChallengeRecord>>;
  protected selectedParameters: PracticeModeReportFlatParameters | null = null;
  protected selectedTab: PracticeModeReportGrouping = PracticeModeReportGrouping.challenge;

  protected getSimpleEntityValue = (g: SimpleEntity) => g.id;
  protected getSimpleEntitySearchText = (g: SimpleEntity) => g.name;
  protected getSponsorValue = (s: ReportSponsor) => s.id;
  protected getSponsorSearchText = (s: ReportSponsor) => s.name;

  // parameter query models
  protected collectionsQueryModel = new MultiSelectQueryParamModel<SimpleEntity>({
    paramName: "collections",
    options: this.reportsService.getPracticeCollections(),
    serializer: (value: SimpleEntity) => value.id,
    deserializer: (value: string, options?: SimpleEntity[]) => options?.find(c => c.id === value) || null
  });

  protected gamesQueryModel: MultiSelectQueryParamModel<SimpleEntity> | null = new MultiSelectQueryParamModel<SimpleEntity>({
    paramName: "games",
    options: firstValueFrom(this.reportsService.getGames()),
    serializer: (value: SimpleEntity) => value.id,
    deserializer: (value: string, options?: SimpleEntity[]) => options?.find(g => g.id === value) || null
  });

  protected practiceDateQueryModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "practiceDateStart",
    dateEndParamName: "practiceDateEnd"
  });

  protected seasonsQueryModel: MultiSelectQueryParamModel<string> | null = MultiSelectQueryParamModel.fromParamName("seasons");
  protected seriesQueryModel: MultiSelectQueryParamModel<string> | null = MultiSelectQueryParamModel.fromParamName("series");
  protected tracksQueryModel: MultiSelectQueryParamModel<string> | null = MultiSelectQueryParamModel.fromParamName("tracks");

  // resources
  protected readonly collectionsResource = resource({
    loader: () => this.reportsService.getPracticeCollections()
  });

  constructor(protected reportService: PracticeModeReportService) {
    super();

    this.unsub.add(
      this.activeReportService.parametersReset$.subscribe(() => {
        this.gamesQueryModel!.searchText = undefined;
        this.seasonsQueryModel!.searchText = undefined;
        this.seriesQueryModel!.searchText = undefined;
        this.tracksQueryModel!.searchText = undefined;
      })
    );
  }

  protected handleOverallStatsUpdate(stats: PracticeModeReportOverallStats) {
    this.overallStats = [
      { label: "Attempts", value: stats.attemptCount },
      { label: "Completions", value: stats.completionCount },
      { label: "Challenges", value: stats.challengeCount },
      { label: "Players", value: stats.playerCount },
      { label: "Sponsors", value: stats.sponsorCount }
    ];
  }

  protected handleTabSelected(tabId: string) {
    const tabIdToEnum = tabId as keyof typeof PracticeModeReportGrouping;
    this.selectedTab = PracticeModeReportGrouping[tabIdToEnum];
  }

  protected async updateView(parameters: PracticeModeReportFlatParameters) {
    if (!parameters) {
      parameters = { grouping: PracticeModeReportGrouping.challenge };
    }

    switch (parameters.grouping) {
      case PracticeModeReportGrouping.challenge:
        this.selectedTab = PracticeModeReportGrouping.challenge;
        break;
      case PracticeModeReportGrouping.player:
        this.selectedTab = PracticeModeReportGrouping.player;
        break;
      case PracticeModeReportGrouping.playerModePerformance:
        this.selectedTab = PracticeModeReportGrouping.playerModePerformance;
        break;
    }

    this.selectedParameters = parameters;

    return {
      metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.PracticeAreaReport)),
    };
  }
}
