import { Component } from '@angular/core';
import { PracticeModeReportSponsorPerformance } from '../practice-mode-report.models';
import { IModalReady } from '@/core/components/modal/modal.models';
import { SimpleEntity } from '@/api/models';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface SponsorChallengePerformanceModalContext extends Partial<SponsorChallengePerformanceComponent> {
  challenge: SimpleEntity;
  sponsorPerformance: PracticeModeReportSponsorPerformance[];
}

@Component({
  selector: 'app-sponsor-challenge-performance',
  templateUrl: './sponsor-challenge-performance.component.html',
  styleUrls: ['./sponsor-challenge-performance.component.scss']
})
export class SponsorChallengePerformanceComponent implements IModalReady<SponsorChallengePerformanceModalContext> {
  context!: SponsorChallengePerformanceModalContext;

  constructor(private modalRef: BsModalRef) { }

  ngOnInit() {
    console.log(this.context);
  }

  close() {
    this.modalRef.hide();
  }
}
