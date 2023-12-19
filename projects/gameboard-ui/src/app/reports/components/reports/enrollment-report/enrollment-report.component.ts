import { Component } from '@angular/core';
import { EnrollmentReportFlatParameters, EnrollmentReportStatSummary, EnrollmentReportTab } from './enrollment-report.models';
import { ReportKey, ReportSponsor, ReportViewUpdate } from '@/reports/reports-models';
import { EnrollmentReportService } from '@/reports/components/reports/enrollment-report/enrollment-report.service';
import { Observable, first, firstValueFrom, map, of } from 'rxjs';
import { SimpleEntity } from '@/api/models';
import { ReportComponentBase } from '../report-base.component';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';
import { deepEquals } from '@/tools/object-tools.lib';

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
export class EnrollmentReportComponent extends ReportComponentBase<EnrollmentReportFlatParameters> {
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
    // if the parameters are identical except paging/tabs, we don't need to reload stats
    const areDeepEqual = deepEquals(
      { ...parameters, pageNumber: undefined, pageSize: undefined, tab: undefined },
      { ...this.selectedParameters, pageNumber: undefined, pageSize: undefined, tab: undefined }
    );

    if (!this.summaryStats || !areDeepEqual) {
      this.ctx = {
        stats$: this.loadSummaryStats(parameters)
      };
    }

    this.selectedParameters = parameters;

    return {
      metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.EnrollmentReport)),
    };
  }

  protected handleTabClick(tab: EnrollmentReportTab) {
    if (tab != this.selectedParameters?.tab) {
      this.routerService.updateQueryParams({ parameters: { tab }, resetParams: ["pageNumber"] });
    }
  }

  private loadSummaryStats(parameters: EnrollmentReportFlatParameters): Observable<EnrollmentReportSummaryStats> {
    // still very confused about why this is sometimes null, but it appears not to affect the experience or performance.
    if (!this.reportService) {
      return of({ importantStat: { label: "--", value: "--" }, otherStats: [] });
    }

    return this.reportService.getSummaryStats(parameters).pipe(
      map(stats => {
        const leadingSponsorStat: ReportSummaryStat = {
          label: "Leading Sponsor",
          value: stats.sponsorWithMostPlayers?.sponsor?.name || "--",
          additionalInfo: stats.sponsorWithMostPlayers ?
            `(${stats.sponsorWithMostPlayers!.distinctPlayerCount} players)` : ""
        };

        const otherStats = [
          { label: "Games", value: stats.distinctGameCount },
          { label: "Players", value: stats.distinctPlayerCount },
          { label: "Teams", value: stats.distinctTeamCount },
          { label: "Sponsors", value: stats.distinctSponsorCount }
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
