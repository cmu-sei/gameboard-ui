import { Component } from '@angular/core';
import { PracticeModeReportSponsorPerformance } from '../practice-mode-report.models';
import { SimpleEntity } from '@/api/models';
import { BsModalRef } from 'ngx-bootstrap/modal';

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
