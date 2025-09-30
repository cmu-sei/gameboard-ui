// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PracticeModeReportSponsorPerformance } from '../practice-mode-report.models';
import { SimpleEntity } from '@/api/models';

export interface SponsorChallengePerformanceModalContext extends Partial<SponsorChallengePerformanceComponent> {
  challenge: SimpleEntity;
  sponsorPerformance: PracticeModeReportSponsorPerformance[];
}

@Component({
  selector: 'app-sponsor-challenge-performance',
  templateUrl: './sponsor-challenge-performance.component.html',
  standalone: false
})
export class SponsorChallengePerformanceComponent {
  context!: SponsorChallengePerformanceModalContext;

  constructor(private modalRef: BsModalRef) { }

  close() {
    this.modalRef.hide();
  }
}
