import { Component, OnInit } from '@angular/core';
import { PracticeModeReportParameters, PracticeModeReportByChallengeRecord, PracticeModeReportGrouping, PracticeModeReportFlatParameters } from './practice-mode-report.models';
import { ReportsService } from '@/reports/reports.service';
import { ActivatedRoute } from '@angular/router';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ReportResults, ReportSponsor } from '@/reports/reports-models';
import { QueryParamModelConfig } from '@/core/directives/query-param-model.directive';
import { PracticeModeReportService } from '@/reports/services/practice-mode-report.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SimpleEntity } from '@/api/models';

type PracticeModeReportSelectedTab = "by-player" | "by-challenge" | "prac-vs-comp";

@Component({
  selector: 'app-practice-mode-report',
  templateUrl: './practice-mode-report.component.html',
  styleUrls: ['./practice-mode-report.component.scss']
})
export class PracticeModeReportComponent implements OnInit {
  // private dateQueryParamModel: QueryParamModelConfig<ReportDateRange> = {
  //   name: "practiceDate",
  //   serialize: (value) => value.dateStart!.toString(),
  //   deserialize: (queryStringValue) => ({ dateStart: new Date(queryStringValue), dateEnd: undefined }),
  // };

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

  private _selectedParameters$ = new BehaviorSubject<PracticeModeReportParameters>({
    practiceDate: {},
    games: [],
    seasons: [],
    series: [],
    sponsors: [],
    tracks: [],
    paging: this.reportsService.getDefaultPaging(),
    grouping: PracticeModeReportGrouping.player
  });
  protected selectedParameters$ = this._selectedParameters$.asObservable();
  protected get selectedParameters(): PracticeModeReportParameters {
    return this._selectedParameters$.value;
  }
  protected set(value: PracticeModeReportParameters) {
    this._selectedParameters$.next(value);
  }

  constructor(
    private reportService: PracticeModeReportService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private unsub: UnsubscriberService) { }

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

        this._selectedParameters$.next(this.reportService.unflattenParameters(queryParams as PracticeModeReportFlatParameters));
      })
    );

    this._selectedParameters$.next(this.selectedParameters);
  }

  protected handleTabSelected(tabId: PracticeModeReportSelectedTab) {
    this.selectedTab = tabId;
  }
}
