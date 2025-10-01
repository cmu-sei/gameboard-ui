// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SiteUsageReportService } from './site-usage-report.service';
import { SiteUsageReport, SiteUsageReportFlatParameters as SiteUsageReportParameters, SiteUsageReportPlayersModalParameters } from './site-usage-report.models';
import { ReportComponentBase } from '../report-base.component';
import { ReportKey, ReportViewUpdate } from '@/reports/reports-models';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SiteUsagePlayerListComponent } from './site-usage-player-list/site-usage-player-list.component';
import { PlayerMode } from '@/api/player-models';
import { SiteUsageReportSponsorsModalComponent } from './site-usage-report-sponsors-modal/site-usage-report-sponsors-modal.component';
import { SiteUsageReportChallengesListComponent } from './site-usage-report-challenges-list/site-usage-report-challenges-list.component';

@Component({
    selector: 'app-site-usage-report',
    styles: [
        ".report-section { margin-top: 60px; }"
    ],
    templateUrl: './site-usage-report.component.html',
    standalone: false
})
export class SiteUsageReportComponent extends ReportComponentBase<SiteUsageReportParameters> {
  protected currentParameters?: SiteUsageReportParameters;
  protected reportData?: SiteUsageReport;
  protected dateQueryModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "startDate",
    dateEndParamName: "endDate"
  });
  protected playerModeEnumCompetitive = PlayerMode.competition;
  protected playerModeEnumPractice = PlayerMode.practice;

  constructor(private modalService: ModalConfirmService, private reportService: SiteUsageReportService) {
    super();
  }

  protected async showChallengesModal() {
    this.modalService.openComponent({
      content: SiteUsageReportChallengesListComponent,
      context: {
        title: "Challenges Attempted",
        subtitle: "Site Usage Report",
        reportParameters: this.currentParameters
      },
      modalClasses: ["modal-lg"]
    });
  }

  protected async showPlayersModal(playerParameters?: SiteUsageReportPlayersModalParameters) {
    if (!this.currentParameters) {
      return;
    }

    this.modalService.openComponent({
      content: SiteUsagePlayerListComponent,
      context: {
        title: "Active Players",
        subtitle: "Site Usage Report",
        playerParameters: playerParameters,
        reportParameters: this.currentParameters
      },
      modalClasses: ["modal-xl"]
    });
  }

  protected async showSponsorsModal() {
    if (!this.currentParameters) {
      return;
    }

    this.modalService.openComponent({
      content: SiteUsageReportSponsorsModalComponent,
      context: {
        title: "Sponsors with Active Players",
        subtitle: "Site Usage Report",
        reportParameters: this.currentParameters
      },
      modalClasses: ["modal-lg"]
    });
  }

  protected async updateView(parameters: SiteUsageReportParameters): Promise<ReportViewUpdate> {
    this.currentParameters = parameters;
    this.reportData = await this.reportService.get(parameters);

    return {
      metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.SiteUsageReport)),
    };
  }
}
