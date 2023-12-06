import { Component } from '@angular/core';
import { PracticeModeReportParameters, PracticeModeReportByChallengeRecord, PracticeModeReportGrouping, PracticeModeReportFlatParameters, PracticeModeReportOverallStats } from './practice-mode-report.models';
import { ReportKey, ReportResults, ReportSponsor } from '@/reports/reports-models';
import { Observable, firstValueFrom } from 'rxjs';
import { SimpleEntity } from '@/api/models';
import { ReportComponentBase } from '../report-base.component';
import { PracticeModeReportService } from '@/reports/components/reports/practice-mode-report/practice-mode-report.service';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';

@Component({
  selector: 'app-practice-mode-report',
  templateUrl: './practice-mode-report.component.html',
  styleUrls: ['./practice-mode-report.component.scss']
})
export class PracticeModeReportComponent
  extends ReportComponentBase<PracticeModeReportFlatParameters, PracticeModeReportParameters> {
  protected overallStats: ReportSummaryStat[] = [];
  protected games$: Observable<SimpleEntity[]> = this.reportsService.getGames();
  protected seasons$: Observable<string[]> = this.reportsService.getSeasons();
  protected series$: Observable<string[]> = this.reportsService.getSeries();
  protected sponsors$: Observable<ReportSponsor[]> = this.reportsService.getSponsors();
  protected tracks$: Observable<string[]> = this.reportsService.getTracks();
  protected byChallengeResults$?: Observable<ReportResults<PracticeModeReportByChallengeRecord>>;
  protected selectedParameters: PracticeModeReportFlatParameters | null = null;
  protected selectedTab: PracticeModeReportGrouping = PracticeModeReportGrouping.challenge;

  protected getGameValue = (g: SimpleEntity) => g.id;
  protected getGameSearchText = (g: SimpleEntity) => g.name;
  protected getSponsorValue = (s: ReportSponsor) => s.id;
  protected getSponsorSearchText = (s: ReportSponsor) => s.name;

  // parameter query models
  protected gamesQueryModel: MultiSelectQueryParamModel<SimpleEntity> | null = new MultiSelectQueryParamModel<SimpleEntity>({
    paramName: "games",
    options: firstValueFrom(this.reportsService.getGames()),
    serializer: (value: SimpleEntity) => value.id,
    deserializer: (value: string, options?: SimpleEntity[]) => options!.find(g => g.id === value) || null
  });

  protected practiceDateQueryModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "practiceDateStart",
    dateEndParamName: "practiceDateEnd"
  });

  protected seasonsQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "seasons"
  });

  protected seriesQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "series"
  });

  protected tracksQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "tracks"
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
      { label: "Attempt", value: stats.attemptCount },
      { label: "Challenge", value: stats.challengeCount },
      { label: "Player", value: stats.playerCount },
      { label: "Sponsor", value: stats.sponsorCount }
    ];
  }

  protected handleTabSelected(tabId: string) {
    const tabIdToEnum: keyof typeof PracticeModeReportGrouping = tabId as keyof typeof PracticeModeReportGrouping;
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
