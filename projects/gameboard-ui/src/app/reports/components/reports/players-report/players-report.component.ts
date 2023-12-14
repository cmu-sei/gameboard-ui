import { Component } from '@angular/core';
import { ReportComponentBase } from '../report-base.component';
import { PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord } from './players-report.models';
import { ReportKey, ReportResults, ReportViewUpdate } from '@/reports/reports-models';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { PlayersReportService } from './players-report.service';
import { firstValueFrom } from 'rxjs';

interface PlayersReportContext {
  isLoading: boolean;
  results?: ReportResults<PlayersReportRecord>;
  selectedParameters: PlayersReportFlatParameters;
}

@Component({
  selector: 'app-players-report',
  templateUrl: './players-report.component.html',
  styleUrls: ['./players-report.component.scss']
})
export class PlayersReportComponent extends ReportComponentBase<PlayersReportFlatParameters, PlayersReportParameters> {
  protected ctx: PlayersReportContext = {
    isLoading: false,
    selectedParameters: {}
  };

  protected createdDateQueryModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "createdDateStart",
    dateEndParamName: "createdDateEnd"
  });

  protected lastPlayedDateQueryModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "lastPlayedDateStart",
    dateEndParamName: "lastPlayedDateEnd"
  });

  constructor(private playersReportService: PlayersReportService) {
    super();
  }

  protected async updateView(parameters: PlayersReportFlatParameters): Promise<ReportViewUpdate> {
    if (!this.playersReportService) {
      return { metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.PlayersReport)) };
    }

    this.ctx.selectedParameters = parameters;
    this.ctx.results = await firstValueFrom(this.playersReportService.getReportData(parameters));

    return {
      metaData: this.ctx.results.metaData,
      // might be able to pull this
      // pagingResults: this.ctx.results.paging
    };
  }
}
