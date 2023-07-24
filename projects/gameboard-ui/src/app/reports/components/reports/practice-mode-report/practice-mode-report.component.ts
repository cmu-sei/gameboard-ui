import { Component, ElementRef, ViewChild } from '@angular/core';
import { PracticeModeReportParameters, PracticeModeReportByChallengeRecord, PracticeModeReportGrouping, PracticeModeReportFlatParameters, PracticeModeReportOverallStats } from './practice-mode-report.models';
import { ReportDateRange, ReportKey, ReportResults, ReportSponsor } from '@/reports/reports-models';
import { Observable, firstValueFrom } from 'rxjs';
import { PagingArgs, SimpleEntity } from '@/api/models';
import { ReportComponentBase } from '../report-base.component';
import { PracticeModeReportService } from '@/reports/services/practice-mode-report.service';
import { QueryParamModelConfig, getDateRangeQueryModelConfig, getStringArrayQueryModelConfig } from '@/core/directives/query-param-model.directive';
import { MultiSelectComponent } from '@/core/components/multi-select/multi-select.component';
import { ParameterDateRangeComponent } from '../../parameters/parameter-date-range/parameter-date-range.component';

@Component({
  selector: 'app-practice-mode-report',
  templateUrl: './practice-mode-report.component.html',
  styleUrls: ['./practice-mode-report.component.scss']
})
export class PracticeModeReportComponent
  extends ReportComponentBase<PracticeModeReportFlatParameters, PracticeModeReportParameters> {
  @ViewChild("byChallenge") byChallengeElementRef?: ElementRef<HTMLElement>;
  @ViewChild("byPlayer") byPlayerElementRef?: ElementRef<HTMLElement>;
  @ViewChild("byPlayerModePerformance") byPlayerModePerformanceElementRef?: ElementRef<HTMLElement>;

  protected overallStats?: PracticeModeReportOverallStats;
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
  protected practiceSessionDateRangeQueryModel?: QueryParamModelConfig<ReportDateRange>;
  @ViewChild("practiceSessionDateRange") set practiceSessionDaterange(component: ParameterDateRangeComponent) {
    if (component)
      this.practiceSessionDateRangeQueryModel = getDateRangeQueryModelConfig({
        propertyNameMap: [
          { propertyName: "dateStart", queryStringParamName: "practiceDateStart" },
          { propertyName: "dateEnd", queryStringParamName: "practiceDateEnd" }
        ],
        emitter: component.ngModelChange
      });
  }

  protected gamesQueryModel?: QueryParamModelConfig<string[]>;
  @ViewChild('gamesMultiSelect') set gamesMultiSelect(component: MultiSelectComponent<string>) {
    if (component) {
      this.gamesQueryModel = getStringArrayQueryModelConfig("gameIds", component.ngModelChange);
    }
  }

  protected seriesQueryModel?: QueryParamModelConfig<string[]>;
  @ViewChild('seriesMultiSelect') set seriesMultiSelect(component: MultiSelectComponent<string>) {
    if (component) {
      this.seriesQueryModel = getStringArrayQueryModelConfig("series", component.ngModelChange);
    }
  }

  protected seasonsQueryModel?: QueryParamModelConfig<string[]>;
  @ViewChild('seasonsMultiSelect') set seasonsMultiSelect(component: MultiSelectComponent<string>) {
    if (component) {
      this.seasonsQueryModel = getStringArrayQueryModelConfig("seasons", component.ngModelChange);
    }
  }

  protected sponsorsQueryModel?: QueryParamModelConfig<string[]>;
  @ViewChild('sponsorsMultiSelect') set sponsorsMultiSelect(component: MultiSelectComponent<string>) {
    if (component) {
      this.sponsorsQueryModel = getStringArrayQueryModelConfig("sponsorIds", component.ngModelChange);
    }
  }

  protected tracksQueryModel?: QueryParamModelConfig<string[]>;
  @ViewChild('tracksMultiSelect') set tracksMultiSelect(component: MultiSelectComponent<string>) {
    if (component) {
      this.tracksQueryModel = getStringArrayQueryModelConfig("tracks", component.ngModelChange);
    }
  }

  constructor(protected reportService: PracticeModeReportService) { super(); }

  protected getDefaultParameters(defaultPaging: PagingArgs): PracticeModeReportParameters {
    return {
      practiceDate: {},
      games: [],
      seasons: [],
      series: [],
      sponsors: [],
      tracks: [],
      paging: defaultPaging,
      grouping: PracticeModeReportGrouping.player
    };
  }

  protected handleOverallStatsUpdate(stats: PracticeModeReportOverallStats) {
    this.overallStats = stats;
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

    const elRef = (() => {
      switch (parameters.grouping) {
        case PracticeModeReportGrouping.challenge:
          return this.byChallengeElementRef;
        case PracticeModeReportGrouping.player:
          return this.byPlayerElementRef;
        case PracticeModeReportGrouping.playerModePerformance:
          return this.byPlayerModePerformanceElementRef;
        default:
          return undefined;
      }
    })();

    this.selectedParameters = parameters;

    return {
      metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.PracticeModeReport)),
      reportElementRef: elRef
    };
  }
}
