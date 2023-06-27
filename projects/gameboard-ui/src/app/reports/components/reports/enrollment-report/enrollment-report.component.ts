import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportParametersUpdate, EnrollmentReportRecord } from './enrollment-report.models';
import { ReportKey, ReportResults } from '@/reports/reports-models';
import { EnrollmentReportService } from '@/reports/services/enrollment-report.service';
import { Observable, Subscription, firstValueFrom, of } from 'rxjs';
import { ReportsService } from '@/reports/reports.service';
import { SimpleEntity } from '@/api/models';
import { RouterService } from '@/services/router.service';
import { PagingRequest } from '@/core/components/select-pager/select-pager.component';
import { ActiveReportService } from '@/reports/services/active-report.service';
import { ActivatedRoute } from '@angular/router';
import { ChallengeResult } from '@/api/board-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
import { LineChartConfig } from '@/core/components/line-chart/line-chart.component';
import { LocaleService } from '@/utility/services/locale.service';
import { DateTime } from 'luxon';

interface EnrollmentReportContext {
  results: ReportResults<EnrollmentReportRecord>;
  chartConfig: LineChartConfig;
  selectedParameters: EnrollmentReportParameters;
}

@Component({
  selector: 'app-enrollment-report',
  templateUrl: './enrollment-report.component.html',
  styleUrls: ['./enrollment-report.component.scss']
})
export class EnrollmentReportComponent implements OnDestroy {
  @ViewChild("enrollmentReport") reportContainer!: ElementRef<HTMLDivElement>;

  ctx$?: Observable<EnrollmentReportContext>;
  seasons$: Observable<string[]> = this.reportsService.getSeasons();
  series$: Observable<string[]> = this.reportsService.getSeries();
  sponsors$: Observable<SimpleEntity[]> = this.reportsService.getSponsors();
  tracks$: Observable<string[]> = this.reportsService.getTracks();

  private queryParamsSub?: Subscription;
  private runRequestSub?: Subscription;

  private _selectedParameters?: EnrollmentReportParameters;
  public get selectedParameters(): EnrollmentReportParameters {
    if (!this._selectedParameters) {
      return {
        enrollDate: {},
        paging: { pageSize: ReportsService.DEFAULT_PAGE_SIZE, pageNumber: 0 },
        seasons: [],
        series: [],
        sponsors: [],
        tracks: []
      };
    }

    return this._selectedParameters;
  }
  public set selectedParameters(value: EnrollmentReportParameters) {
    this._selectedParameters = value;
    this.updateView(value);
  }

  constructor(
    public reportService: EnrollmentReportService,
    private activeReportService: ActiveReportService,
    private localeService: LocaleService,
    private markdownHelpersService: MarkdownHelpersService,
    private modalService: ModalConfirmService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
    private routerService: RouterService) { }

  ngOnInit(): void {
    this.queryParamsSub = this.route.queryParams.subscribe(query => {
      console.log("query", query);
      const reportParams = this.reportService.unflattenParameters({ ...query });
      console.log("unflattened to", reportParams);
      // this causes the report to reload
      this.selectedParameters = reportParams;
    });

    this.runRequestSub = this.activeReportService.runRequest$.subscribe(_ => {
      this.routerService.toReport(ReportKey.EnrollmentReport, this.reportService.flattenParameters(this.selectedParameters));
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
    this.runRequestSub?.unsubscribe();
  }

  protected buildParameterChangeUrl(parameterBuilder: EnrollmentReportParametersUpdate) {
    const updatedSelectedParameters: EnrollmentReportFlatParameters = this.reportService.flattenParameters({ ...this.selectedParameters, ...parameterBuilder });
    return this.routerService.getReportRoute(ReportKey.EnrollmentReport, updatedSelectedParameters).toString();
  }

  protected displaySponsorName(s: SimpleEntity) {
    return s.name;
  }

  protected getSponsorValue(s: SimpleEntity) {
    return s.id;
  }

  protected showChallengesDetail(record: EnrollmentReportRecord, challengeStatus: "deployed" | "partial" | "complete") {
    let challenges: { name: string, score?: number, maxPossiblePoints: number }[] = [];

    switch (challengeStatus) {
      case "partial":
        challenges = record.challenges.filter(c => c.result == ChallengeResult.Partial);
        break;
      case "complete":
        challenges = record.challenges.filter(c => c.result == ChallengeResult.Complete);
        break;
      default:
        challenges = record.challenges;
    }

    this.modalService.open({
      bodyContent: this
        .markdownHelpersService
        .arrayToBulletList(challenges.map(c => `${c.name} (${c.score || "--"}/${c.maxPossiblePoints})`)),
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

  protected handlePagingChange(paging: PagingRequest) {
    const parameterChangeUrl = this.buildParameterChangeUrl({ paging: { pageNumber: paging.page, pageSize: ReportsService.DEFAULT_PAGE_SIZE } });
    this.routerService.router.navigateByUrl(parameterChangeUrl);
  }

  private async updateView(params: EnrollmentReportParameters) {
    const reportResults = await firstValueFrom(this.reportService.getReportData(params));
    const lineChartResults = await this.reportService.getTrendData(params);

    this.ctx$ = of({
      results: reportResults,
      chartConfig: {
        type: 'line',
        data: {
          labels: Array.from(lineChartResults.keys()).map(k => k as any),
          datasets: [
            {
              label: "Enrolled players",
              data: Array.from(lineChartResults.values()).map(g => g.totalCount),
              backgroundColor: 'blue',
              color: "blue"
            },
          ]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              distribution: 'series',
              time: {
                displayFormats: {
                  day: "MM/dd/yy",
                },
                tooltipFormat: 'DD',
                unit: "day"
              }
            }
          }
        }
      },
      selectedParameters: params
    });

    this.activeReportService.metaData$.next(reportResults.metaData);
    this.activeReportService.htmlElement$.next(this.reportContainer);
  }
}
