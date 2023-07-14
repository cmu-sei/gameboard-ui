import { Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PracticeModeReportByChallengeRecord, PracticeModeReportParameters, PracticeModeReportSponsorPerformance } from '../practice-mode-report.models';
import { ReportResults, ReportSponsor } from '@/reports/reports-models';
import { PagingRequest } from '@/core/components/select-pager/select-pager.component';
import { PracticeModeReportService } from '@/reports/services/practice-mode-report.service';
import { RouterService } from '@/services/router.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SponsorChallengePerformanceComponent, SponsorChallengePerformanceModalContext } from '../sponsor-challenge-performance/sponsor-challenge-performance.component';
import { SimpleEntity } from '@/api/models';

@Component({
  selector: 'app-practice-mode-report-by-challenge',
  templateUrl: './practice-mode-report-by-challenge.component.html',
  styleUrls: ['./practice-mode-report-by-challenge.component.scss']
})
export class PracticeModeReportByChallengeComponent implements OnChanges {
  @Input() parameters: PracticeModeReportParameters | null = null;
  @ViewChild("sponsorPerformance") sponsorPerformanceTemplate?: TemplateRef<PracticeModeReportSponsorPerformance[]>;

  protected results: ReportResults<PracticeModeReportByChallengeRecord> | null = null;

  constructor(
    private modalService: ModalConfirmService,
    private reportService: PracticeModeReportService,
    private routerService: RouterService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.parameters) {
      this.results = null;
    }

    if (changes.parameters.currentValue) {
      const results = await firstValueFrom(this.reportService.getByChallengeData(changes.parameters.currentValue));
      this.results = results as ReportResults<PracticeModeReportByChallengeRecord>;
    }
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
      modalClasses: "modal-dialog-centered modal-xl"
    });
  }

  handlePagingChange($event: PagingRequest) {
    this.routerService.updateQueryParams({ parameters: { ...$event } });
  }
}
