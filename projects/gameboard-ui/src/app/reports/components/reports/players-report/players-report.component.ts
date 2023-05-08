import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord } from './players-report.models';
import { ReportKey, ReportMetaData, ReportResults, ReportTrackParameter, ReportTrackParameterModifier } from '../../../reports-models';
import { IReportComponent } from '../../report-component';
import { ObjectService } from 'projects/gameboard-ui/src/app/services/object.service';
import { PlayersReportService } from '@/reports/services/players-report.service';

interface PlayersReportContext {
  results: ReportResults<PlayersReportRecord>;
  selectedParameters: PlayersReportParameters;
}

@Component({
  selector: 'app-players-report',
  templateUrl: './players-report.component.html',
  styleUrls: ['./players-report.component.scss']
})
export class PlayersReportComponent implements IReportComponent<PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord>, OnInit {
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
    public reportService: PlayersReportService) {
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

  private async updateView(params?: PlayersReportParameters) {
    const apiParams = params ? this.reportService.flattenParameters(params) : undefined;
    const results = await firstValueFrom(this.reportService.getReportData(apiParams));

    this.ctx = {
      results,
      selectedParameters: params || {}
    };

    this.onResultsLoaded(results.metaData);
  }
}

