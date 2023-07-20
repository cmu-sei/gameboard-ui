import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PracticeModeReportByPlayerModePerformanceRecord, PracticeModeReportFlatParameters, PracticeModeReportOverallStats, PracticeModeReportParameters } from '../practice-mode-report.models';
import { ReportResultsWithOverallStats } from '@/reports/reports-models';
import { firstValueFrom } from 'rxjs';
import { PracticeModeReportService } from '@/reports/services/practice-mode-report.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PlayerModePerformanceSummaryComponent, PlayerModePerformanceSummaryContext } from '@/reports/components/reports/practice-mode-report/player-mode-performance-summary/player-mode-performance-summary.component';
import { LogService } from '@/services/log.service';
import { PagingArgs } from '@/api/models';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-practice-mode-report-by-player-mode-performance',
  templateUrl: './practice-mode-report-by-player-mode-performance.component.html',
})
export class PracticeModeReportByPlayerModePerformanceComponent implements OnInit {
  @Input() parameters: PracticeModeReportFlatParameters | null = null;
  @Output() overallStatsUpdate = new EventEmitter<PracticeModeReportOverallStats>();

  protected isLoading = false;
  protected results: ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByPlayerModePerformanceRecord> | null = null;

  constructor(
    private log: LogService,
    private modalService: ModalConfirmService,
    private reportService: PracticeModeReportService,
    private routerService: RouterService) { }

  async ngOnInit(): Promise<void> {
    if (!this.parameters) {
      this.log.logError("Couldn't load user mode performance data for the practice report: no parameters specified.");
      return;
    }

    this.results = await firstValueFrom(this.reportService.getByPlayerModePerformance(this.parameters));
  }

  protected totalAttemptsClicked(event: { userId: string, isPractice: boolean }) {
    this.modalService.openComponent({
      content: PlayerModePerformanceSummaryComponent,
      context: event as PlayerModePerformanceSummaryContext,
      modalClasses: ["modal-dialog-centered", "modal-lg"]
    });
  }

  protected handlePagingChange($event: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...$event } });
  }
}
