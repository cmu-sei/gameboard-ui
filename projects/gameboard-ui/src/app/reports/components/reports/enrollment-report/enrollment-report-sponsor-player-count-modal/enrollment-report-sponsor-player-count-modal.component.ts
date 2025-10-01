// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SimpleEntity } from '@/api/models';
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
    styleUrls: ['./enrollment-report-sponsor-player-count-modal.component.scss'],
    standalone: false
})
export class EnrollmentReportSponsorPlayerCountModalComponent {
  context!: EnrollmentReportSponsorPlayerCountModalContext;

  constructor(private modalRef: BsModalRef) { }

  protected close() {
    if (this.modalRef)
      this.modalRef.hide();
  }
}
