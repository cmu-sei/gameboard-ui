import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportParametersUpdate, EnrollmentReportRecord } from './enrollment-report.models';
import { ReportDateRange, ReportResults, ReportViewUpdate } from '@/reports/reports-models';
import { EnrollmentReportService } from '@/reports/services/enrollment-report.service';
import { Observable, Subscription, firstValueFrom, of } from 'rxjs';
import { PagingArgs, SimpleEntity } from '@/api/models';
import { RouterService } from '@/services/router.service';
import { ChallengeResult } from '@/api/board-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
import { LineChartConfig } from '@/core/components/line-chart/line-chart.component';
import { ReportComponentBase } from '../report-base.component';
import { QueryParamModelConfig, getDateRangeQueryModelConfig, getStringArrayQueryModelConfig, stringArrayDeserializer, stringArraySerializer } from '@/core/directives/query-param-model.directive';
import { MultiSelectComponent } from '@/core/components/multi-select/multi-select.component';
import { ParameterDateRangeComponent } from '../../parameters/parameter-date-range/parameter-date-range.component';

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
export class EnrollmentReportComponent extends ReportComponentBase<EnrollmentReportFlatParameters, EnrollmentReportParameters> {
  @ViewChild("enrollmentReport") reportContainer!: ElementRef<HTMLDivElement>;

  ctx$?: Observable<EnrollmentReportContext>;
  seasons$: Observable<string[]> = this.reportsService.getSeasons();
  series$: Observable<string[]> = this.reportsService.getSeries();
  sponsors$: Observable<SimpleEntity[]> = this.reportsService.getSponsors();
  tracks$: Observable<string[]> = this.reportsService.getTracks();

  protected displaySponsorName = (s: SimpleEntity) => s.name;
  protected getSponsorValue = (s: SimpleEntity) => s.id;
  protected selectedParameters?: EnrollmentReportParameters;

  protected enrollmentDateRangeQueryModel?: QueryParamModelConfig<ReportDateRange>;
  @ViewChild("enrollmentDateRange") set enrollmentDateRange(component: ParameterDateRangeComponent) {
    if (component) {
      this.enrollmentDateRangeQueryModel = getDateRangeQueryModelConfig({
        propertyNameMap: [
          { propertyName: "dateStart", queryStringParamName: "enrollDateStart" },
          { propertyName: "dateEnd", queryStringParamName: "enrollDateEnd" }
        ],
        emitter: component.ngModelChange
      });
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

  constructor(
    private markdownHelpersService: MarkdownHelpersService,
    private modalService: ModalConfirmService,
    private reportService: EnrollmentReportService,
    private routerService: RouterService) {
    super();
  }

  getDefaultParameters(defaultPaging: PagingArgs): EnrollmentReportParameters {
    return {
      enrollDate: {},
      paging: defaultPaging,
      seasons: [],
      series: [],
      sponsors: [],
      tracks: []
    };
  }

  async updateView(parameters: EnrollmentReportFlatParameters): Promise<ReportViewUpdate> {
    const reportResults = await firstValueFrom(this.reportService.getReportData(parameters));
    const lineChartResults = await this.reportService.getTrendData(parameters);
    const structuredParameters = this.unflattenParameters(parameters);

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
      selectedParameters: structuredParameters,
      results: reportResults,
    });

    return {
      metaData: reportResults.metaData,
      reportContainerRef: this.reportContainer,
    };
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

  protected handlePagingChange(paging: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...paging } });
  }

  private unflattenParameters(parameters: EnrollmentReportFlatParameters): EnrollmentReportParameters {
    const defaultPaging = this.reportsService.getDefaultPaging();

    return {
      enrollDate: {
        dateStart: this.reportsService.queryStringEncodedDateToDate(parameters.enrollDateStart),
        dateEnd: this.reportsService.queryStringEncodedDateToDate(parameters.enrollDateEnd)
      },
      paging: {
        pageNumber: parseInt((parameters.pageNumber || defaultPaging.pageNumber)!.toString()),
        pageSize: parseInt((parameters.pageSize || defaultPaging.pageSize)!.toString())
      },
      seasons: this.reportsService.unflattenMultiSelectValues(parameters.seasons),
      series: this.reportsService.unflattenMultiSelectValues(parameters.series),
      sponsors: this.reportsService
        .unflattenMultiSelectValues(parameters.sponsorIds)
        .map<SimpleEntity>(v => ({ id: v, name: '' })),
      tracks: this.reportsService.unflattenMultiSelectValues(parameters.tracks)
    };
  }
}
