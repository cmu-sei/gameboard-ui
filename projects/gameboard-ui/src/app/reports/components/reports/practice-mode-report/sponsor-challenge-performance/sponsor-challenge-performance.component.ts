import { Component, Input } from '@angular/core';
import { PracticeModeReportSponsorPerformance } from '../practice-mode-report.models';

@Component({
  selector: 'app-sponsor-challenge-performance',
  templateUrl: './sponsor-challenge-performance.component.html',
  styleUrls: ['./sponsor-challenge-performance.component.scss']
})
export class SponsorChallengePerformanceComponent {
  @Input() sponsorPerformance?: PracticeModeReportSponsorPerformance;

  ngOnInit() {
    console.log(this.sponsorPerformance);
  }
}
