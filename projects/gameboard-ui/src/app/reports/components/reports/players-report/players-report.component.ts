import { Component } from '@angular/core';
import { ReportComponentBase } from '../report-base.component';
import { PlayersReportFlatParameters, PlayersReportRecord, PlayersReportStatSummary } from './players-report.models';
import { ReportKey, ReportResultsWithOverallStats, ReportViewUpdate } from '@/reports/reports-models';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { PlayersReportService } from './players-report.service';
import { firstValueFrom } from 'rxjs';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { SimpleEntity } from '@/api/models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PlayersReportParticipationSummaryComponent, PlayersReportParticipationSummaryContext } from '../../players-report-participation-summary/players-report-participation-summary.component';

interface PlayersReportContext {
  isLoading: boolean;
  results?: ReportResultsWithOverallStats<PlayersReportStatSummary, PlayersReportRecord>;
  selectedParameters: PlayersReportFlatParameters;
}

@Component({
  selector: 'app-players-report',
  templateUrl: './players-report.component.html',
  styleUrls: ['./players-report.component.scss']
})
export class PlayersReportComponent extends ReportComponentBase<PlayersReportFlatParameters> {
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

  protected seasonsQueryModel = MultiSelectQueryParamModel.fromParamName("seasons");
  protected seriesQueryModel = MultiSelectQueryParamModel.fromParamName("series");
  protected tracksQueryModel = MultiSelectQueryParamModel.fromParamName("tracks");

  constructor(
    private modalService: ModalConfirmService,
    private playersReportService: PlayersReportService) {
    super();
  }

  protected showPlayerParticipation(record: PlayersReportRecord) {
    this.modalService.openComponent<PlayersReportParticipationSummaryComponent>({
      content: PlayersReportParticipationSummaryComponent,
      context: {
        context: {
          player: {
            id: record.user.id,
            name: record.user.name,
            sponsor: record.sponsor
          },
          series: record.distinctSeriesPlayed,
          seasons: record.distinctSeasonsPlayed,
          tracks: record.distinctTracksPlayed,
          games: record.distinctGamesPlayed
        }
      }
    });
  }

  protected async updateView(parameters: PlayersReportFlatParameters): Promise<ReportViewUpdate> {
    if (!this.playersReportService) {
      return { metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.PlayersReport)) };
    }

    this.ctx.selectedParameters = parameters;
    this.ctx.isLoading = true;
    this.ctx.results = await firstValueFrom(this.playersReportService.getReportData(parameters));
    this.ctx.isLoading = false;

    return {
      metaData: this.ctx.results.metaData
    };
  }
}
