import { Component, ViewChild } from '@angular/core';
import { EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportRecord, EnrollmentReportStatSummary, EnrollmentReportTab } from './enrollment-report.models';
import { ReportResultsWithOverallStats, ReportSponsor, ReportViewUpdate } from '@/reports/reports-models';
import { EnrollmentReportService } from '@/reports/components/reports/enrollment-report/enrollment-report.service';
import { Observable, firstValueFrom, of } from 'rxjs';
import { SimpleEntity } from '@/api/models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
import { LineChartConfig } from '@/core/components/line-chart/line-chart.component';
import { ReportComponentBase } from '../report-base.component';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

interface EnrollmentReportContext {
  results: ReportResultsWithOverallStats<EnrollmentReportStatSummary, EnrollmentReportRecord>;
  chartConfig: LineChartConfig;
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

  protected ctx$?: Observable<EnrollmentReportContext>;
  protected displayGameName = (s: SimpleEntity) => s.name;
  protected getGameValue = (s: SimpleEntity) => s.id;
  protected displaySponsorName = (s: ReportSponsor) => s.name;
  protected getSponsorValue = (s: ReportSponsor) => s.id;
  protected isLoading = false;

  protected results?: ReportResultsWithOverallStats<EnrollmentReportStatSummary, EnrollmentReportRecord>;
  protected leadingSponsorStat?: ReportSummaryStat;
  protected selectedParameters: EnrollmentReportFlatParameters | null = { tab: "summary" };
  protected stats: ReportSummaryStat[] = [];

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
    private markdownHelpersService: MarkdownHelpersService,
    private modalService: ModalConfirmService,
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

    this.isLoading = true;
    this.selectedParameters = parameters;
    this.results = await firstValueFrom(this.reportService.getReportData(parameters));
    const lineChartResults = await this.reportService.getTrendData(parameters);

    this.leadingSponsorStat = this.results.overallStats.sponsorWithMostPlayers ?
      {
        label: "Leading Sponsor",
        value: this.results.overallStats.sponsorWithMostPlayers?.sponsor.name,
        additionalInfo: `(${this.results.overallStats.sponsorWithMostPlayers.distinctPlayerCount} players)`
      } :
      undefined;

    this.stats = [
      { label: "Game", value: this.results.overallStats.distinctGameCount },
      { label: "Player", value: this.results.overallStats.distinctPlayerCount },
      { label: "Team", value: this.results.overallStats.distinctTeamCount },
      { label: "Sponsor", value: this.results.overallStats.distinctSponsorCount }
    ]
      .filter(e => !!e)
      .map(e => e as ReportSummaryStat);

    this.isLoading = false;

    this.ctx$ = of({
      chartConfig: {
        type: 'line',
        data: {
          labels: Array.from(lineChartResults.keys()).map(k => k as any),
          datasets: [
            {
              label: "Enrolled players",
              data: Array.from(lineChartResults.values()).map(g => g.totalCount),
              backgroundColor: 'blue',
            },
          ]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                displayFormats: {
                  day: "MM/dd/yy",
                },
                tooltipFormat: 'DD',
                unit: "day"
              },
              title: {
                display: true,
                text: "Enrollment Date"
              }
            },
            y: {
              title: {
                display: true,
                text: "Players Enrolled"
              }
            }
          }
        }
      },
      results: this.results,
    });

    return {
      metaData: this.results.metaData,
      pagingResults: this.results.paging,
    };
  }

  protected handleTabClick(tab: EnrollmentReportTab) {
    if (tab != this.selectedParameters?.tab) {
      this.routerService.updateQueryParams({ parameters: { tab } });
    }
  }

  protected showChallengesDetail(record: EnrollmentReportRecord, challengeStatus: "deployed" | "partial" | "complete") {
    let challenges: { name: string, score?: number, maxPossiblePoints: number }[] = [];

    switch (challengeStatus) {
      case "partial":
        challenges = record.challenges.filter(c => c.result == "partial");
        break;
      case "complete":
        challenges = record.challenges.filter(c => c.result == "success");
        break;
      default:
        challenges = record.challenges;
    }

    this.modalService.open({
      bodyContent: this
        .markdownHelpersService
        .arrayToBulletList(challenges.map(c => `${c.name} (${c.score || "--"}/${c.maxPossiblePoints}) possible points`)),
      renderBodyAsMarkdown: true,
      title: `${record.player.name}: Challenges ${challengeStatus.substring(0, 1).toUpperCase()}${challengeStatus.substring(1)}`,
    });
  }

  protected showScoreBreakdown(record: EnrollmentReportRecord) {
    const scoreItems: { points: number, source: string }[] = [];

    for (const challenge of record.challenges) {
      if (challenge.score)
        scoreItems.push({ points: challenge.score, source: `**${challenge.name}**, ${challenge.result.toString()} solve` });

      if (challenge.manualChallengeBonuses?.length) {
        for (const bonus of challenge.manualChallengeBonuses) {
          scoreItems.push({ points: bonus.points, source: `**Manual bonus**, ${bonus.description}` });
        }
      }
    }

    this.modalService.open({
      bodyContent: this
        .markdownHelpersService
        .arrayToBulletList(scoreItems.map(i => `${i.points} (${i.source})`)),
      renderBodyAsMarkdown: true,
      title: `${record.player.name}: Score Breakdown`
    });
  }
}
