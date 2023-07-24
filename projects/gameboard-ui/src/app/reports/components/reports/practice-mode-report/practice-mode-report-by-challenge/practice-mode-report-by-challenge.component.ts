import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PracticeModeReportByChallengeRecord, PracticeModeReportFlatParameters, PracticeModeReportOverallStats, PracticeModeReportSponsorPerformance } from '../practice-mode-report.models';
import { ReportResultsWithOverallStats } from '@/reports/reports-models';
import { PracticeModeReportService } from '@/reports/services/practice-mode-report.service';
import { RouterService } from '@/services/router.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SponsorChallengePerformanceComponent, SponsorChallengePerformanceModalContext } from '../sponsor-challenge-performance/sponsor-challenge-performance.component';
import { PagingArgs, SimpleEntity } from '@/api/models';
import { LogService } from '@/services/log.service';

@Component({
  selector: 'app-practice-mode-report-by-challenge',
  templateUrl: './practice-mode-report-by-challenge.component.html',
  styleUrls: ['./practice-mode-report-by-challenge.component.scss']
})
export class PracticeModeReportByChallengeComponent implements OnChanges {
  @Input() parameters: PracticeModeReportFlatParameters | null = null;
  @Output() overallStatsUpdate = new EventEmitter<PracticeModeReportOverallStats>();
  @ViewChild("sponsorPerformance") sponsorPerformanceTemplate?: TemplateRef<PracticeModeReportSponsorPerformance[]>;

  protected results: ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByChallengeRecord> | null = null;

  constructor(
    private log: LogService,
    private modalService: ModalConfirmService,
    private reportService: PracticeModeReportService,
    private routerService: RouterService) { }

  async ngOnChanges(changes: SimpleChanges) {
    if (!changes.parameters) {
      return;
    }

    this.results = await firstValueFrom(this.reportService.getByChallengeData(this.parameters));
    this.overallStatsUpdate.emit(this.results.overallStats);
  }

  handleSponsorsClicked(challenge: SimpleEntity, sponsorPerformance: PracticeModeReportSponsorPerformance[]) {
    if (!this.sponsorPerformanceTemplate) {
      throw new Error("Couldn't resolve the sponsor performance template.");
    }

    this.modalService.openComponent<SponsorChallengePerformanceComponent, SponsorChallengePerformanceModalContext>({
      content: SponsorChallengePerformanceComponent,
      context: {
        challenge,
        sponsorPerformance
      },
      modalClasses: ["modal-dialog-centered", "modal-xl"]
    });
  }

  handlePagingChange($event: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...$event } });
  }
}
