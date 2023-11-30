import { Component, ViewChild } from '@angular/core';
import { EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportStatSummary, EnrollmentReportTab } from './enrollment-report.models';
import { ReportKey, ReportSponsor, ReportViewUpdate } from '@/reports/reports-models';
import { EnrollmentReportService } from '@/reports/components/reports/enrollment-report/enrollment-report.service';
import { Observable, first, firstValueFrom, map, of } from 'rxjs';
import { SimpleEntity } from '@/api/models';
import { ReportComponentBase } from '../report-base.component';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

interface EnrollmentReportContext {
  stats$: Observable<EnrollmentReportSummaryStats>
}

interface EnrollmentReportSummaryStats {
  importantStat: ReportSummaryStat;
  otherStats: ReportSummaryStat[];
}

@Component({
  selector: 'app-enrollment-report',
  templateUrl: './enrollment-report.component.html',
  styleUrls: ['./enrollment-report.component.scss']
})
export class EnrollmentReportComponent extends ReportComponentBase<EnrollmentReportFlatParameters, EnrollmentReportParameters> {
  @ViewChild('reportTabs', { static: false }) reportTabs?: TabsetComponent;

  games$ = this.reportsService.getGames();
  seasons$ = this.reportsService.getSeasons();
  series$ = this.reportsService.getSeries();
  tracks$ = this.reportsService.getTracks();

  protected ctx?: EnrollmentReportContext;
  protected displayGameName = (s: SimpleEntity) => s.name;
  protected getGameValue = (s: SimpleEntity) => s.id;
  protected displaySponsorName = (s: ReportSponsor) => s.name;
  protected getSponsorValue = (s: ReportSponsor) => s.id;

  protected leadingSponsorStat?: ReportSummaryStat;
  protected selectedParameters: EnrollmentReportFlatParameters | null = { tab: "summary" };
  protected summaryStats?: EnrollmentReportStatSummary;

  // parameter query models
  protected enrollmentDateRangeModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "enrollDateStart",
    dateEndParamName: "enrollDateEnd"
  });

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

  constructor(
    private reportService: EnrollmentReportService) {
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

  async updateView(parameters: EnrollmentReportFlatParameters): Promise<ReportViewUpdate> {
    // TODO: figure out why "this.reportService" is undefined sometimes but not others
    if (!this.reportService) {
      return null as unknown as ReportViewUpdate;
    }

    console.log("selected parameters", parameters);
    this.selectedParameters = parameters;
    this.ctx = {
      stats$: this.loadSummaryStats(parameters)
    };

    return {
      metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.EnrollmentReport)),
    };
  }

  protected handleTabClick(tab: EnrollmentReportTab) {
    if (tab != this.selectedParameters?.tab) {
      this.routerService.updateQueryParams({ parameters: { tab } });
    }
  }

  private loadSummaryStats(parameters: EnrollmentReportFlatParameters): Observable<EnrollmentReportSummaryStats> {
    return this.reportService.getSummaryStats(parameters).pipe(
      map(stats => {
        const leadingSponsorStat: ReportSummaryStat = {
          label: "Leading Sponsor",
          value: stats.sponsorWithMostPlayers!.sponsor.name,
          additionalInfo: `(${stats.sponsorWithMostPlayers!.distinctPlayerCount} players)`
        };

        const otherStats = [
          { label: "Game", value: stats.distinctGameCount },
          { label: "Player", value: stats.distinctPlayerCount },
          { label: "Team", value: stats.distinctTeamCount },
          { label: "Sponsor", value: stats.distinctSponsorCount }
        ]
          .filter(e => !!e)
          .map(e => e! as ReportSummaryStat);

        return {
          importantStat: leadingSponsorStat,
          otherStats
        };
      }),
      first(),
    );
  }
}
