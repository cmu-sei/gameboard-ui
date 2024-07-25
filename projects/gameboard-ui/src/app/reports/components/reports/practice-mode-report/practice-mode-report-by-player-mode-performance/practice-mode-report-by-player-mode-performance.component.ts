import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PracticeModeReportByPlayerModePerformanceRecord, PracticeModeReportByUserRecord, PracticeModeReportFlatParameters, PracticeModeReportOverallStats } from '../practice-mode-report.models';
import { ReportResultsWithOverallStats } from '@/reports/reports-models';
import { firstValueFrom } from 'rxjs';
import { PracticeModeReportService } from '@/reports/components/reports/practice-mode-report/practice-mode-report.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PlayerModePerformanceSummaryComponent, PlayerModePerformanceSummaryContext } from '@/reports/components/reports/practice-mode-report/player-mode-performance-summary/player-mode-performance-summary.component';
import { LogService } from '@/services/log.service';
import { PagingArgs } from '@/api/models';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-practice-mode-report-by-player-mode-performance',
  templateUrl: './practice-mode-report-by-player-mode-performance.component.html',
})
export class PracticeModeReportByPlayerModePerformanceComponent implements OnChanges {
  @Input() parameters: PracticeModeReportFlatParameters | null = null;
  @Output() overallStatsUpdate = new EventEmitter<PracticeModeReportOverallStats>();

  protected isLoading = false;
  protected results: ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByPlayerModePerformanceRecord> | null = null;

  constructor(
    private log: LogService,
    private modalService: ModalConfirmService,
    private reportService: PracticeModeReportService,
    private routerService: RouterService) { }

  async ngOnChanges(changes: SimpleChanges) {
    if (!changes.parameters) {
      return;
    }

    this.results = await firstValueFrom(this.reportService.getByPlayerModePerformance(this.parameters));
    this.overallStatsUpdate.emit(this.results.overallStats);
  }

  protected totalAttemptsClicked(event: { userId: string, isPractice: boolean }) {
    this.modalService.openComponent({
      content: PlayerModePerformanceSummaryComponent,
      context: { context: { ...event } },
      modalClasses: ["modal-lg"]
    });
  }

  protected handlePagingChange($event: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...$event } });
  }
}
