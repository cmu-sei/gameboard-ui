import { AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord } from './players-report.models';
import { ReportKey, ReportMetaData, ReportResults, ReportTrackParameter, ReportTrackParameterModifier } from '../../../reports-models';
import { IReportComponent } from '../../report-component';
import { PlayersReportService } from '@/reports/services/players-report.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SimpleEntity } from '@/api/models';

interface PlayersReportContext {
  results: ReportResults<PlayersReportRecord>;
  selectedParameters: PlayersReportParameters;
}

@Component({
  selector: 'app-players-report',
  templateUrl: './players-report.component.html',
  styleUrls: ['./players-report.component.scss']
})
export class PlayersReportComponent implements AfterViewInit, IReportComponent<PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord> {
  ctx: PlayersReportContext | null = null;

  private _selectedParameters?: PlayersReportParameters;
  public get selectedParameters(): PlayersReportParameters | undefined { return this._selectedParameters; }
  public set selectedParameters(value: PlayersReportParameters | undefined) {
    this._selectedParameters = value;
    this.updateView(value);
  }

  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")
  @ViewChildren('playersReport', { read: ElementRef<HTMLDivElement> }) protected viewContainerRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private reportElementRef?: ElementRef<HTMLDivElement>;
  private viewContainerRefsSub?: Subscription;

  constructor(
    public modalService: ModalConfirmService,
    public enrollmentReportService: PlayersReportService) {
  }

  ngAfterViewInit(): void {
    this.viewContainerRefs!.changes.subscribe(item => {
      this.reportElementRef = this.viewContainerRefs ? this.viewContainerRefs.get(0) : undefined;
    });
  }

  getPdfExportElement(): ElementRef<HTMLDivElement> {
    return this.reportElementRef!;
  }

  getReportKey(): ReportKey {
    return ReportKey.PlayersReport;
  }

  simpleEntitiesToStrings(entities: SimpleEntity[]): string[] {
    return entities.map(e => e.name);
  }

  handleModalRequest(title: string, items: string[], itemTypeName?: string) {
    const unspecifiedEntry = itemTypeName ? `[Unspecified ${itemTypeName}]` : "[Unspecified]";

    this.modalService.openConfirm({
      title,
      bodyContent: items
        .map(i => `- ${i || unspecifiedEntry}`).join("\n"),
      hideCancel: true,
      renderBodyAsMarkdown: true
    });
  }

  private async updateView(params?: PlayersReportParameters) {
    const apiParams = params ? this.enrollmentReportService.flattenParameters(params) : undefined;
    const results = await firstValueFrom(this.enrollmentReportService.getReportData(apiParams));

    this.ctx = {
      results,
      selectedParameters: params || { gameChallengeSpec: {} }
    };
  }
}

