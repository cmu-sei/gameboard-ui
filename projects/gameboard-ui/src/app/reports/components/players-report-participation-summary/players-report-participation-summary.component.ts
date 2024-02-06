import { ReportSponsor } from '@/reports/reports-models';
import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface PlayersReportParticipationSummaryContext {
  player: {
    id: string,
    name: string,
    sponsor: ReportSponsor,
  };
  series: string[];
  seasons: string[];
  tracks: string[];
  games: string[];
}

@Component({
  selector: 'app-players-report-participation-summary',
  templateUrl: './players-report-participation-summary.component.html',
  styleUrls: ['./players-report-participation-summary.component.scss']
})
export class PlayersReportParticipationSummaryComponent {
  context!: PlayersReportParticipationSummaryContext;

  constructor(private modalRef: BsModalRef) { }

  handleModalClose() {
    this.modalRef.hide();
  }
}
