import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PlayersReportParameters, PlayersReportRecord } from './players-report.models';
import { ReportResults, ReportTrackParameterModifier, ReportViewUpdate } from '../../../reports-models';
import { ReportComponentBase } from '../report-base.component';
import { PlayersReportService } from '@/reports/services/players-report.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SimpleEntity } from '@/api/models';
import { ActiveReportService } from '@/reports/services/active-report.service';

interface PlayersReportContext {
  results: ReportResults<PlayersReportRecord>;
  selectedParameters: PlayersReportParameters;
}

@Component({
  selector: 'app-players-report',
  templateUrl: './players-report.component.html',
  styleUrls: ['./players-report.component.scss']
})
export class PlayersReportComponent
  extends ReportComponentBase<PlayersReportParameters, PlayersReportRecord>
  implements AfterViewInit, OnInit {
  getDefaultParameters(): PlayersReportParameters {
    return {
      gameChallengeSpec: {},
      track: { track: undefined, modifier: ReportTrackParameterModifier.CompetedInOnlyThisTrack }
    };
  }
  ctx: PlayersReportContext | null = null;

  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")
  @ViewChildren('playersReport', { read: ElementRef<HTMLDivElement> }) protected viewContainerRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private reportElementRef?: ElementRef<HTMLDivElement>;

  constructor(
    activeReportService: ActiveReportService,
    public modalService: ModalConfirmService,
    public reportService: PlayersReportService) {
    super(activeReportService);
  }

  async ngOnInit(): Promise<void> {
    await this.updateView(this.selectedParameters);
  }

  ngAfterViewInit(): void {
    this.viewContainerRefs!.changes.subscribe(item => {
      this.reportElementRef = this.viewContainerRefs ? this.viewContainerRefs.get(0) : undefined;
    });
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

  async updateView(params?: PlayersReportParameters): Promise<ReportViewUpdate> {
    const apiParams = params ? this.reportService.flattenParameters(params) : undefined;
    const results = await firstValueFrom(this.reportService.getReportData(apiParams));

    this.ctx = {
      results,
      selectedParameters: params || { gameChallengeSpec: {} }
    };

    return {
      metaData: results.metaData,
      reportContainerRef: this.reportElementRef!
    };
  }
}

