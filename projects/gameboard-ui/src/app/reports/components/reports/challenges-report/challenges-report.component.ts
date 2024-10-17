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

export interface ChallengesReportContext {
  isLoading: boolean,
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
    isLoading: true,
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

  protected challengeTagsQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({ paramName: "tags" });

  protected seasonsQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "seasons"
  });

  protected seriesQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "series"
  });

  protected tracksQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "tracks"
  });

  protected startDateRangeModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "startDateStart",
    dateEndParamName: "startDateEnd"
  });

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

  protected async updateView(parameters: ChallengesReportFlatParameters): Promise<ReportViewUpdate> {
    if (!this.challengesReportService)
      return { metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.ChallengesReport)) };

    this.ctx.selectedParameters = parameters;
    this.ctx.isLoading = true;
    this.ctx.results = await firstValueFrom(this.challengesReportService.getReportData(parameters));
    this.ctx.isLoading = false;

    return { metaData: this.ctx.results.metaData };
  }
}
