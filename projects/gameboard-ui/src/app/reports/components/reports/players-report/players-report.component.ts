import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PlayersReportFlatParameters, PlayersReportParameters, PlayersReportRecord } from './players-report.models';
import { ReportResults, ReportViewUpdate } from '../../../reports-models';
import { ReportComponentBase } from '../report-base.component';
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
export class PlayersReportComponent extends ReportComponentBase<PlayersReportFlatParameters, PlayersReportParameters> {

  ctx: PlayersReportContext | null = null;

  constructor(
    public modalService: ModalConfirmService,
    public reportService: PlayersReportService) {
    super();
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

  async updateView(params: PlayersReportFlatParameters): Promise<ReportViewUpdate> {
    const structuredParameters = this.reportService.unflattenParameters(params);
    const results = await firstValueFrom(this.reportService.getReportData(structuredParameters));

    this.ctx = {
      results,
      selectedParameters: structuredParameters
    };

    return {
      metaData: results.metaData
    };
  }
}

