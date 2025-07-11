import { PracticeModeReportService } from '@/reports/components/reports/practice-mode-report/practice-mode-report.service';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PracticeModeReportPlayerModeSummary } from '../practice-mode-report.models';
import { firstValueFrom } from 'rxjs';

export interface PlayerModePerformanceSummaryContext extends Partial<PlayerModePerformanceSummaryComponent> {
  userId: string;
  isPractice: boolean
  summary?: PracticeModeReportPlayerModeSummary;
}

@Component({
    selector: 'app-player-mode-performance-summary',
    templateUrl: './player-mode-performance-summary.component.html',
    styleUrls: ['./player-mode-performance-summary.component.scss'],
    standalone: false
})
export class PlayerModePerformanceSummaryComponent implements OnInit {
  context!: PlayerModePerformanceSummaryContext;

  constructor(
    private modalRef: BsModalRef,
    private reportService: PracticeModeReportService) { }

  async ngOnInit() {
    this.context.summary = await firstValueFrom(this.reportService.getPlayerModeSummary({
      userId: this.context.userId,
      isPractice: this.context.isPractice
    }));
  }

  protected close() {
    this.modalRef.hide();
  }
}
