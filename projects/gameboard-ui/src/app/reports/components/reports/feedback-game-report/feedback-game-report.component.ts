import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { firstValueFrom, subscribeOn } from 'rxjs';
import { ReportComponentBase } from '../report-base.component';
import { FeedbackGameReportParameters, FeedbackGameReportResponse, FeedbackReportDetails } from './feedback-game-report.models';
import { ReportKey, ReportViewUpdate } from '@/reports/reports-models';
import { NowService } from '@/services/now.service';
import { GameChallengeSpecQueryModel } from '@/core/models/game-challenge-spec-query-param.model';
import { fa } from '@/services/font-awesome.service';
import { FeedbackReportService } from './feedback-report.service';
import { FeedbackService } from '@/api/feedback.service';
import { ReportService } from '@/api/report.service';
import { cloneNonNullAndDefinedProperties } from '@/../tools/object-tools.lib';

@Component({
    selector: 'app-feedback-game-report',
    templateUrl: './feedback-game-report.component.html',
    styleUrls: ['./feedback-game-report.component.scss'],
    standalone: false
})
export class FeedbackGameReportComponent extends ReportComponentBase<FeedbackGameReportParameters> {
  protected fa = fa;
  protected feedback?: FeedbackReportDetails[];
  protected gameChallengeQuerystringModel: GameChallengeSpecQueryModel | null = new GameChallengeSpecQueryModel();
  protected hasParameterSelection = false;
  protected results?: FeedbackGameReportResponse;
  protected showQuestions = true;
  protected showResults = true;
  protected showSummary = true;
  protected showTable = true;
  protected skip = 0;

  private _currentParams?: FeedbackGameReportParameters;
  private _tablePageSize = 25;

  constructor(
    private feedbackService: FeedbackService,
    private reportServiceLegacy: ReportService,
    private nowService: NowService,
    private reportService: FeedbackReportService) {
    super();
  }

  protected export(key: string) {
    if (key == "details")
      this.reportServiceLegacy.exportFeedbackDetails(this.makeSearchParams(), this.createExportName(false));
    else if (key == "stats")
      this.reportServiceLegacy.exportFeedbackStats(this.makeSearchParams(), this.createExportName(true));
  }

  protected async next() {
    this.skip = this.skip + this._tablePageSize;
    await this.fetchFeedback();
  }

  protected async prev() {
    this.skip = this.skip - this._tablePageSize;
    if (this.skip < 0)
      this.skip = 0;
    await this.fetchFeedback();
  }

  protected toggle(item: string) {
    if (item == 'summary')
      this.showSummary = !this.showSummary;
    if (item == 'questions')
      this.showQuestions = !this.showQuestions;
    if (item == 'table')
      this.showTable = !this.showTable;
  }

  protected toggleRow(i: number) {
    if (window.getSelection()?.toString()?.length != 0)
      return;
    let id = "row-" + i;
    document.getElementById(id)?.classList.toggle('minimized');
  }

  protected async updateView(parameters: FeedbackGameReportParameters): Promise<ReportViewUpdate> {
    if (!this.reportService)
      return { metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.FeedbackReport)) };

    this._currentParams = parameters;
    this.hasParameterSelection = !!this._currentParams?.gameId;
    if (!this._currentParams?.gameId) {
      this.results = undefined;
    }
    this.results = this._currentParams?.gameId ? await this.reportService.get(parameters) : undefined;

    // reload for new game/challenge
    this.skip = 0;
    await this.fetchFeedback();

    return {
      metaData: {
        key: ReportKey.FeedbackReportLegacy,
        title: "Feedback Report (Legacy)",
        description: "",
        isExportable: true,
        runAt: this.nowService?.nowToDateTime() || DateTime.now()
      }
    };
  }

  private createExportName(isStats: boolean) {
    if (!this.results)
      return "";

    const stats = isStats ? "-stats" : "";
    return `${this.results.game.name}-game-feedback${stats}-`;
  }

  private async fetchFeedback() {
    this.feedback = undefined;
    const params = cloneNonNullAndDefinedProperties(this.makeSearchParams());
    this.feedback = await firstValueFrom(this.feedbackService.list(params));
  }

  makeSearchParams() {
    return {
      challengeSpecId: this._currentParams?.challengeSpecId,
      gameId: this._currentParams?.gameId,
      submitStatus: "submitted",
      sort: "newest",
      skip: this.skip,
      take: this._tablePageSize,
      type: this._currentParams?.challengeSpecId ? "challenge" : "game"
    };
  }
}
