import { Component } from '@angular/core';
import { ReportComponentBase } from '../report-base.component';
import { PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord } from './players-report.models';
import { ReportKey, ReportResults, ReportViewUpdate } from '@/reports/reports-models';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { PlayersReportService } from './players-report.service';
import { firstValueFrom } from 'rxjs';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { SimpleEntity } from '@/api/models';

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

  protected games$ = this.reportsService.getGames();
  protected seasons$ = this.reportsService.getSeasons();
  protected series$ = this.reportsService.getSeries();
  protected tracks$ = this.reportsService.getTracks();

  protected createdDateQueryModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "createdDateStart",
    dateEndParamName: "createdDateEnd"
  });

  protected displayGameName = (s: SimpleEntity) => s.name;
  protected getGameValue = (s: SimpleEntity) => s.id;
  protected gamesQueryModel: MultiSelectQueryParamModel<SimpleEntity> | null = new MultiSelectQueryParamModel<SimpleEntity>({
    paramName: "games",
    options: firstValueFrom(this.reportsService.getGames()),
    serializer: (value: SimpleEntity) => value.id,
    deserializer: (value: string, options?: SimpleEntity[]) => options!.find(g => g.id === value) || null
  });

  protected lastPlayedDateQueryModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "lastPlayedDateStart",
    dateEndParamName: "lastPlayedDateEnd"
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
      metaData: this.ctx.results.metaData
    };
  }
}
