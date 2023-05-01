import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subscription, firstValueFrom, map, switchMap, tap } from 'rxjs';
import { PlayersReportFlatParameters, PlayersReportParameters, PlayersReportResults } from './players-report.models';
import { ReportsService } from '../../reports.service';
import { ReportKey, ReportMetaData } from '../../reports-models';
import { IReportComponent } from '../report-component';
import { UriService } from '../../../services/uri.service';

interface PlayersReportContext {
  results: PlayersReportResults;
  selectedParameters: PlayersReportParameters;
}

@Component({
  selector: 'app-players-report',
  templateUrl: './players-report.component.html',
  styleUrls: ['./players-report.component.scss']
})
export class PlayersReportComponent implements IReportComponent<PlayersReportParameters>, OnInit {
  @Input() onResultsLoaded!: (metadata: ReportMetaData) => void;
  ctx: PlayersReportContext | null = null;
  // selectedParameters: PlayersReportParameters = {};

  private _selectedParameters?: PlayersReportParameters;
  public get selectedParameters(): PlayersReportParameters | undefined { return this._selectedParameters };
  public set selectedParameters(value: PlayersReportParameters | undefined) {
    this._selectedParameters = value;
    this.updateView(value);
  };

  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")
  @ViewChildren('playersReport', { read: ElementRef<HTMLDivElement> }) protected viewContainerRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private reportElementRef?: ElementRef<HTMLDivElement>;
  private viewContainerRefsSub?: Subscription;

  constructor(
    private uriService: UriService,
    private reportsService: ReportsService) {
  }

  ngOnInit(): void {
  }

  getPdfExportElement(): ElementRef<HTMLDivElement> {
    return this.reportElementRef!;
  }

  getParametersQuery(): string {
    if (!this.selectedParameters) {
      return "";
    }

    const flatParameters: PlayersReportFlatParameters = {
      trackModifier: this.selectedParameters.track?.modifier,
      trackName: this.selectedParameters.track?.track,
      ... this.selectedParameters
    }

    delete (flatParameters as any)['track'];

    return this.uriService.toQueryString(flatParameters);
  }

  getReportKey(): ReportKey {
    return ReportKey.PlayersReport;
  }

  handleParametersChanged(event: any) {
    console.log("selected params:", this.selectedParameters)
  }

  resetParameters(): void {
    this.selectedParameters = {};
  }

  private async updateView(params?: PlayersReportParameters) {
    const results = await firstValueFrom(this.reportsService.getPlayersReport(params));
    this.ctx = {
      results,
      selectedParameters: params || {}
    };

    this.onResultsLoaded(results.metaData);
  }
}
