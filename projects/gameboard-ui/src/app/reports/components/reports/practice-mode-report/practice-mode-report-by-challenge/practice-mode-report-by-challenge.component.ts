import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PracticeModeReportByChallengeRecord, PracticeModeReportFlatParameters, PracticeModeReportGrouping, PracticeModeReportOverallStats, PracticeModeReportSponsorPerformance } from '../practice-mode-report.models';
import { ReportResultsWithOverallStats } from '@/reports/reports-models';
import { PracticeModeReportService } from '@/reports/components/reports/practice-mode-report/practice-mode-report.service';
import { RouterService } from '@/services/router.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SponsorChallengePerformanceComponent } from '../sponsor-challenge-performance/sponsor-challenge-performance.component';
import { PagingArgs, SimpleEntity } from '@/api/models';
import { ChallengeDetailModalComponent } from '../challenge-detail-modal/challenge-detail-modal.component';
import { ChallengeResult } from '@/api/board-models';
import { fa } from '@/services/font-awesome.service';

@Component({
    selector: 'app-practice-mode-report-by-challenge',
    templateUrl: './practice-mode-report-by-challenge.component.html',
    styleUrls: ['./practice-mode-report-by-challenge.component.scss'],
    standalone: false
})
export class PracticeModeReportByChallengeComponent implements OnChanges {
  @Input() parameters: PracticeModeReportFlatParameters | null = null;
  @Output() overallStatsUpdate = new EventEmitter<PracticeModeReportOverallStats>();
  @ViewChild("sponsorPerformance") sponsorPerformanceTemplate?: TemplateRef<PracticeModeReportSponsorPerformance[]>;

  protected errors: any[] = [];
  protected fa = fa;
  protected isDownloadingCsv = false;
  protected results: ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByChallengeRecord> | null = null;

  constructor(
    private modalService: ModalConfirmService,
    private reportService: PracticeModeReportService,
    private routerService: RouterService) { }

  async ngOnChanges(changes: SimpleChanges) {
    if (!changes.parameters) {
      return;
    }

    this.errors = [];
    this.results = await firstValueFrom(this.reportService.getByChallengeData(this.parameters));
    this.overallStatsUpdate.emit(this.results.overallStats);
  }

  async handleGetSubmissionsCsvClicked(specId?: string) {
    try {
      this.isDownloadingCsv = true;
      await this.reportService.getSubmissionsCsv(this.parameters || { grouping: PracticeModeReportGrouping.challenge }, specId);
    }
    catch (err) {
      this.errors.push(err);
    }

    this.isDownloadingCsv = false;
  }

  handlePlayersClicked(specId: string) {
    this.modalService.openComponent<ChallengeDetailModalComponent>({
      content: ChallengeDetailModalComponent,
      context: {
        challengeSpecId: specId,
        parameters: this.parameters || undefined
      },
      modalClasses: ["modal-xl"]
    });
  }

  handleSolveTypeClicked(specId: string, type: ChallengeResult) {
    this.modalService.openComponent<ChallengeDetailModalComponent>({
      content: ChallengeDetailModalComponent,
      context: {
        challengeSpecId: specId,
        challengeDetailParameters: {
          playersWithSolveType: type
        },
        parameters: this.parameters || undefined,
      },
      modalClasses: ["modal-xl"]
    });
  }

  handleSponsorsClicked(challenge: SimpleEntity, sponsorPerformance: PracticeModeReportSponsorPerformance[]) {
    if (!this.sponsorPerformanceTemplate) {
      throw new Error("Couldn't resolve the sponsor performance template.");
    }

    this.modalService.openComponent<SponsorChallengePerformanceComponent>({
      content: SponsorChallengePerformanceComponent,
      context: {
        context: {
          challenge,
          sponsorPerformance
        }
      },
      modalClasses: ["modal-xl"]
    });
  }

  handlePagingChange($event: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...$event } });
  }
}
