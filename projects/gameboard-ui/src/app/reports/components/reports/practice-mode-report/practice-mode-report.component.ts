import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PracticeModeReportParameters, PracticeModeReportByChallengeRecord, PracticeModeReportGrouping, PracticeModeReportFlatParameters, PracticeModeReportRecord } from './practice-mode-report.models';
import { ReportsService } from '@/reports/reports.service';
import { ActivatedRoute } from '@angular/router';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ReportKey, ReportResults, ReportSponsor } from '@/reports/reports-models';
import { QueryParamModelConfig } from '@/core/directives/query-param-model.directive';
import { Observable, firstValueFrom } from 'rxjs';
import { SimpleEntity } from '@/api/models';
import { ReportComponentBase } from '../report-base.component';
import { ActiveReportService } from '@/reports/services/active-report.service';

type PracticeModeReportSelectedTab = "by-player" | "by-challenge" | "prac-vs-comp";

@Component({
  selector: 'app-practice-mode-report',
  templateUrl: './practice-mode-report.component.html',
  styleUrls: ['./practice-mode-report.component.scss']
})
export class PracticeModeReportComponent extends ReportComponentBase<PracticeModeReportParameters, PracticeModeReportRecord> implements OnInit {
  // private dateQueryParamModel: QueryParamModelConfig<ReportDateRange> = {
  //   name: "practiceDate",
  //   serialize: (value) => value.dateStart!.toString(),
  //   deserialize: (queryStringValue) => ({ dateStart: new Date(queryStringValue), dateEnd: undefined }),
  // };

  @ViewChild("byChallenge") byChallengeElementRef?: ElementRef<HTMLElement>;
  @ViewChild("byPlayer") byPlayerElementRef?: ElementRef<HTMLElement>;
  @ViewChild("pracVComp") pracVCompElementRef?: ElementRef<HTMLElement>;

  protected games$: Observable<SimpleEntity[]> = this.reportsService.getGames();
  protected seasons$: Observable<string[]> = this.reportsService.getSeasons();
  protected series$: Observable<string[]> = this.reportsService.getSeries();
  protected sponsors$: Observable<ReportSponsor[]> = this.reportsService.getSponsors();
  protected tracks$: Observable<string[]> = this.reportsService.getTracks();
  protected byChallengeResults$?: Observable<ReportResults<PracticeModeReportByChallengeRecord>>;
  protected selectedTab: PracticeModeReportSelectedTab = "by-player";

  protected getGameValue = (g: SimpleEntity) => g.id;
  protected getGameSearchText = (g: SimpleEntity) => g.name;
  protected getSponsorValue = (s: ReportSponsor) => s.id;
  protected getSponsorSearchText = (s: ReportSponsor) => s.name;

  constructor(
    protected activeReportService: ActiveReportService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private unsub: UnsubscriberService) { super(activeReportService); }

  async ngOnInit(): Promise<void> {
    this.unsub.add(
      this.route.params.subscribe(async params => {
        const queryParams = { ...params };
        if (!queryParams.grouping) {
          queryParams.grouping = PracticeModeReportGrouping.player;
        }

        const parameters = queryParams as PracticeModeReportParameters;

        switch (parameters.grouping) {
          case PracticeModeReportGrouping.challenge:
            this.selectedTab = "by-challenge";
            break;
          case PracticeModeReportGrouping.player:
            this.selectedTab = "by-player";
            break;
          case PracticeModeReportGrouping.practiceVersusCompetitive:
            this.selectedTab = "prac-vs-comp";
            break;
        }
      })
    );
  }

  protected getDefaultParameters(): PracticeModeReportParameters {
    return {
      practiceDate: {},
      games: [],
      seasons: [],
      series: [],
      sponsors: [],
      tracks: [],
      paging: {},
      grouping: PracticeModeReportGrouping.player
    };
  }

  protected handleTabSelected(tabId: PracticeModeReportSelectedTab) {
    this.selectedTab = tabId;
  }

  protected async updateView(parameters: PracticeModeReportParameters) {
    const elRef = (() => {
      switch (parameters.grouping) {
        case PracticeModeReportGrouping.challenge:
          return this.byChallengeElementRef;
        case PracticeModeReportGrouping.player:
          return this.byPlayerElementRef;
        case PracticeModeReportGrouping.practiceVersusCompetitive:
          return this.pracVCompElementRef;
        default:
          return undefined;
      }
    })();

    return {
      metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.PracticeModeReport)),
      reportElementRef: elRef
    };
  }
}
