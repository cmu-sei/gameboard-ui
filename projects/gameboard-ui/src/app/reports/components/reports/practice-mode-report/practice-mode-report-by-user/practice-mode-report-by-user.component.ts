import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { PracticeModeReportOverallStats, PracticeModeReportByUserRecord, PracticeModeReportFlatParameters } from '../practice-mode-report.models';
import { firstValueFrom } from 'rxjs';
import { PracticeModeReportService } from '@/reports/components/reports/practice-mode-report/practice-mode-report.service';
import { ReportResultsWithOverallStats } from '@/reports/reports-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { RouterService } from '@/services/router.service';
import { PagingArgs } from '@/api/models';
import { PlayerChallengeAttempts, PlayerChallengeAttemptsModalComponent } from '@/reports/components/player-challenge-attempts-modal/player-challenge-attempts-modal.component';

@Component({
    selector: 'app-practice-mode-report-by-user',
    templateUrl: './practice-mode-report-by-user.component.html',
    standalone: false
})
export class PracticeModeReportByUserComponent implements OnChanges {
  @Input() parameters: PracticeModeReportFlatParameters | null = null;
  @Output() overallStatsUpdate = new EventEmitter<PracticeModeReportOverallStats>();

  protected isLoading = true;
  protected results: ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByUserRecord> | null = null;


  constructor(
    private modalService: ModalConfirmService,
    private reportService: PracticeModeReportService,
    private routerService: RouterService) {
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (!changes.parameters)
      return;

    this.results = await firstValueFrom(this.reportService.getByUserData(this.parameters));
    this.overallStatsUpdate.emit(this.results.overallStats);
  }


  handleModalClose() {
    this.modalService.hide();
  }

  protected handlePagingChange(request: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...request } });
  }

  protected showAttemptsSummary(record: PracticeModeReportByUserRecord): void {
    this.modalService.openComponent<PlayerChallengeAttemptsModalComponent>({
      content: PlayerChallengeAttemptsModalComponent,
      context: {
        context: {
          player: {
            name: record.user.name,
            sponsor: record.user.sponsor,
          },
          subtitle: `Practice Challenge: ${record.challenge.name}`,
          subtitleDetail: record.challenge.game.name,
          attempts: record.attempts.map(a => ({
            challengeSpec: { id: record.challenge.id, name: record.challenge.name },
            game: record.challenge.game,
            maxPossibleScore: record.challenge.maxPossibleScore,
            result: a.result,
            score: a.score || 0,
            startDate: a.start
          }))
        }
      },
      modalClasses: ["modal-md"]
    });
  }
}
