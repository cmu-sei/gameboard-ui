import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { FeedbackTemplateView } from '@/feedback/feedback.models';
import { FeedbackService } from '@/api/feedback.service';
import { ReportKey, ReportResultsWithOverallStats, ReportViewUpdate } from '@/reports/reports-models';
import { FeedbackReportParameters, FeedbackReportRecord, FeedbackReportStatSummary } from './feedback-report.models';
import { ReportComponentBase } from '../report-base.component';
import { firstValueFrom } from 'rxjs';
import { FeedbackReportService } from './feedback-report.service';
import { QueryParamModelConfig } from '@/core/directives/query-param-model.directive';
import { SimpleEntity } from '@/api/models';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PlayerFeedbackResponsesModalComponent } from './player-feedback-responses-modal/player-feedback-responses-modal.component';

export interface FeedbackReportViewContext {
  isLoading: boolean;
  parameters: FeedbackReportParameters;
  results?: ReportResultsWithOverallStats<FeedbackReportStatSummary, FeedbackReportRecord>;
  stats: ReportSummaryStat[]
}

@Component({
  selector: 'app-feedback-report',
  templateUrl: './feedback-report.component.html',
  styleUrls: ['./feedback-report.component.scss']
})
export class FeedbackReportComponent extends ReportComponentBase<FeedbackReportParameters> {
  @ViewChild("playerResponsesModal") playerResponsesModalTemplate?: TemplateRef<any>;

  private feedbackService = inject(FeedbackService);
  private feedbackReportService = inject(FeedbackReportService);
  private modalService = inject(ModalConfirmService);

  protected ctx: FeedbackReportViewContext = {
    isLoading: false,
    parameters: { templateId: "" },
    stats: []
  };
  protected games$ = this.reportsService.getGames();
  protected isLoaded = false;
  protected results?: ReportResultsWithOverallStats<FeedbackReportStatSummary, FeedbackReportRecord>;
  protected templates: FeedbackTemplateView[] = [];

  protected createdQueryParamModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "submissionDateStart",
    dateEndParamName: "submissionDateEnd"
  });

  protected displayGameName = (s: SimpleEntity) => s.name;
  protected getGameValue = (s: SimpleEntity) => s.id;
  protected gamesQueryModel: MultiSelectQueryParamModel<SimpleEntity> | null = new MultiSelectQueryParamModel<SimpleEntity>({
    paramName: "games",
    options: firstValueFrom(this.games$),
    serializer: (value: SimpleEntity) => value.id,
    deserializer: (value: string, options?: SimpleEntity[]) => options!.find(g => g.id === value) || null
  });

  protected seasons$ = this.reportsService.getSeasons();
  protected seasonsQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "seasons"
  });

  protected series$ = this.reportsService.getSeries();
  protected seriesQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "series"
  });

  protected tracks$ = this.reportsService.getTracks();
  protected tracksQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "tracks"
  });

  protected templateQueryParamModel: QueryParamModelConfig<string> | null = {
    name: "templateId"
  };

  protected handleRecordClick(record: FeedbackReportRecord) {
    this.modalService.openComponent({
      content: PlayerFeedbackResponsesModalComponent,
      context: {
        record,
        templateId: this.ctx.parameters.templateId
      }
    });
  }

  protected async updateView(parameters: FeedbackReportParameters): Promise<ReportViewUpdate> {
    if (!this.feedbackService) {
      return { metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.FeedbackReport)) };
    }

    if (!this.templates.length) {
      this.templates = await this.feedbackService.getTemplates();
    }

    this.ctx.parameters = parameters;
    if (this.templates.length && !this.ctx.parameters.templateId) {
      this.routerService.updateQueryParams({ parameters: { templateId: this.templates[0].id } });
      this.ctx.parameters.templateId = this.templates[0].id;
    }

    this.ctx.isLoading = true;
    this.ctx.results = await this.feedbackReportService.getReportData(parameters);
    this.ctx.stats = [
      { label: "Unique Games", value: this.ctx.results.overallStats.uniqueGamesCount },
      { label: "Unique Challenges", value: this.ctx.results.overallStats.uniqueChallengesCount },
      { label: "Unique Games", value: this.ctx.results.overallStats.uniqueGamesCount },
      { label: "Unfinalized Responses", value: this.ctx.results.overallStats.unfinalizedCount },
      { label: "Questions", value: this.ctx.results.overallStats.questionCount || 0 }
    ];
    this.ctx.isLoading = false;

    return {
      metaData: this.ctx.results.metaData
    };
  }
}
