import { SimpleEntity } from '@/api/models';
import { IModalReady } from '@/core/components/modal/modal.models';
import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { EnrollmentReportByGameSponsor } from '../enrollment-report.models';

export interface EnrollmentReportSponsorPlayerCountModalContext {
  game: SimpleEntity;
  sponsors: EnrollmentReportByGameSponsor[]
}

@Component({
  selector: 'app-enrollment-report-sponsor-player-count-modal',
  templateUrl: './enrollment-report-sponsor-player-count-modal.component.html',
  styleUrls: ['./enrollment-report-sponsor-player-count-modal.component.scss']
})
export class EnrollmentReportSponsorPlayerCountModalComponent implements IModalReady<EnrollmentReportSponsorPlayerCountModalContext> {
  context!: EnrollmentReportSponsorPlayerCountModalContext;

  constructor(private modalRef: BsModalRef) { }

  protected close() {
    if (this.modalRef)
      this.modalRef.hide();
  }
}
