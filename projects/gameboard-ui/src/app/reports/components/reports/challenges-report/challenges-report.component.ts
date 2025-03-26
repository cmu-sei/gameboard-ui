import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ReportComponentBase } from '../report-base.component';
import { ChallengesReportFlatParameters, ChallengesReportRecord, ChallengesReportStatSummary } from './challenges-report.models';
import { ReportKey, ReportResultsWithOverallStats, ReportViewUpdate } from '@/reports/reports-models';
import { ChallengesReportService } from '../challenges-report.service';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { SimpleEntity } from '@/api/models';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SpecQuestionPerformanceModalComponent } from '../../spec-question-performance-modal/spec-question-performance-modal.component';
import { fa } from '@/services/font-awesome.service';

export interface ChallengesReportContext {
  isDownloadingCsv: boolean,
  results?: ReportResultsWithOverallStats<ChallengesReportStatSummary, ChallengesReportRecord>
  selectedParameters: ChallengesReportFlatParameters,
}

@Component({
  selector: 'app-challenges-report',
  templateUrl: './challenges-report.component.html',
  styleUrls: ['./challenges-report.component.scss']
})
export class ChallengesReportComponent extends ReportComponentBase<ChallengesReportFlatParameters> {
  protected ctx: ChallengesReportContext = {
    isDownloadingCsv: false,
    selectedParameters: {}
  };

  protected challengeTags$ = this.reportsService.getChallengeTags();
  protected games$ = this.reportsService.getGames();
  protected seasons$ = this.reportsService.getSeasons();
  protected series$ = this.reportsService.getSeries();
  protected tracks$ = this.reportsService.getTracks();

  protected displayGameName = (s: SimpleEntity) => s.name;
  protected getGameValue = (s: SimpleEntity) => s.id;
  protected gamesQueryModel: MultiSelectQueryParamModel<SimpleEntity> | null = new MultiSelectQueryParamModel<SimpleEntity>({
    paramName: "games",
    options: firstValueFrom(this.reportsService.getGames()),
    serializer: (value: SimpleEntity) => value.id,
    deserializer: (value: string, options?: SimpleEntity[]) => options!.find(g => g.id === value) || null
  });

  protected challengeTagsQueryModel: MultiSelectQueryParamModel<string> | null = MultiSelectQueryParamModel.fromParamName("tags");
  protected seasonsQueryModel: MultiSelectQueryParamModel<string> | null = MultiSelectQueryParamModel.fromParamName("seasons");
  protected seriesQueryModel: MultiSelectQueryParamModel<string> | null = MultiSelectQueryParamModel.fromParamName("series");
  protected tracksQueryModel: MultiSelectQueryParamModel<string> | null = MultiSelectQueryParamModel.fromParamName("tracks");

  protected startDateRangeModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "startDateStart",
    dateEndParamName: "startDateEnd"
  });

  protected fa = fa;

  constructor(
    private challengesReportService: ChallengesReportService,
    private modalService: ModalConfirmService) {
    super();
  }

  protected handleSpecClick(spec: SimpleEntity) {
    this.modalService.openComponent<SpecQuestionPerformanceModalComponent>({
      content: SpecQuestionPerformanceModalComponent,
      context: { specId: spec.id },
      modalClasses: ["modal-lg"]
    });
  }

  protected async handleSubmissionsCsvClick(challengeSpecId?: string) {
    this.ctx.isDownloadingCsv = true;
    await this.challengesReportService.getSubmissionsCsv(this.ctx.selectedParameters, challengeSpecId);
    this.ctx.isDownloadingCsv = false;
  }

  protected async updateView(parameters: ChallengesReportFlatParameters): Promise<ReportViewUpdate> {
    this.ctx.selectedParameters = parameters;
    this.ctx.results = await firstValueFrom(this.challengesReportService.getReportData(parameters));

    return { metaData: this.ctx.results.metaData };
  }
}
