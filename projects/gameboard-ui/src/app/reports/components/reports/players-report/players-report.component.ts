import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { PlayersReportFlatParameters, PlayersReportParameters, PlayersReportResults } from './players-report.models';
import { ReportsService } from '../../../reports.service';
import { ReportKey, ReportMetaData, ReportTrackParameter, ReportTrackParameterModifier } from '../../../reports-models';
import { IReportComponent } from '../../report-component';
import { ObjectService } from 'projects/gameboard-ui/src/app/services/object.service';

interface PlayersReportContext {
  results: PlayersReportResults;
  selectedParameters: PlayersReportParameters;
}

@Component({
  selector: 'app-players-report',
  templateUrl: './players-report.component.html',
  styleUrls: ['./players-report.component.scss']
})
export class PlayersReportComponent implements IReportComponent<PlayersReportFlatParameters, PlayersReportParameters>, OnInit {
  @Input() onResultsLoaded!: (metadata: ReportMetaData) => void;
  ctx: PlayersReportContext | null = null;

  private _selectedParameters?: PlayersReportFlatParameters;
  public get selectedParameters(): PlayersReportFlatParameters | undefined { return this._selectedParameters };
  public set selectedParameters(value: PlayersReportFlatParameters | undefined) {
    this._selectedParameters = value;
    this.updateView(value);
  };

  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")
  @ViewChildren('playersReport', { read: ElementRef<HTMLDivElement> }) protected viewContainerRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private reportElementRef?: ElementRef<HTMLDivElement>;
  private viewContainerRefsSub?: Subscription;

  constructor(
    private objectService: ObjectService,
    private reportsService: ReportsService) {
  }

  ngOnInit(): void {
  }

  getPdfExportElement(): ElementRef<HTMLDivElement> {
    return this.reportElementRef!;
  }

  getReportKey(): ReportKey {
    return ReportKey.PlayersReport;
  }

  handleParametersChanged(event: any) {
  }

  buildParameters(params?: PlayersReportFlatParameters): PlayersReportParameters {
    if (!params) {
      return {};
    }

    const trackName = params.trackName;
    const trackModifier = params.trackModifier;
    const sessionStartBeginDate = params.playerSessionStartBeginDate;
    const sessionStartEndDate = params.playerSessionStartEndDate;

    this.objectService.deleteKeys(params, "trackModifier", "trackName", "playerSessionStartBeginDate", "playerSessionStartEndDate");

    return {
      sessionStartWindow: sessionStartBeginDate || sessionStartEndDate ? {
        dateStart: sessionStartBeginDate,
        dateEnd: sessionStartEndDate
      } : undefined,
      track: {
        track: trackName,
        modifier: trackModifier || ReportTrackParameterModifier.CompetedInThisTrack,
      },
      ...params
    };
  }

  flattenParameters(parameters: PlayersReportParameters): PlayersReportFlatParameters {
    const flattened: PlayersReportFlatParameters = {
      playerSessionStartBeginDate: parameters.sessionStartWindow?.dateStart,
      playerSessionStartEndDate: parameters.sessionStartWindow?.dateEnd,
      trackModifier: parameters.track?.modifier,
      trackName: parameters.track?.track,
      ...parameters
    };

    this.objectService.deleteKeys(flattened, "track", "sessionStartWindow");

    return flattened;
  }

  private async updateView(params?: PlayersReportParameters) {
    const apiParams = params ? this.flattenParameters(params) : undefined;
    const results = await firstValueFrom(this.reportsService.getPlayersReport(apiParams));

    this.ctx = {
      results,
      selectedParameters: params || {}
    };

    this.onResultsLoaded(results.metaData);
  }
}

