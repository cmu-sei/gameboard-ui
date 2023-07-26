import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PracticeModeReportOverallStats, PracticeModeReportByUserRecord, PracticeModeReportFlatParameters } from '../practice-mode-report.models';
import { firstValueFrom } from 'rxjs';
import { PracticeModeReportService } from '@/reports/components/reports/practice-mode-report/practice-mode-report.service';
import { ReportResultsWithOverallStats } from '@/reports/reports-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
import { FriendlyDatesService } from '@/services/friendly-dates.service';
import { RouterService } from '@/services/router.service';
import { PagingArgs } from '@/api/models';

@Component({
  selector: 'app-practice-mode-report-by-user',
  templateUrl: './practice-mode-report-by-user.component.html',
})
export class PracticeModeReportByUserComponent implements OnChanges {
  @Input() parameters: PracticeModeReportFlatParameters | null = null;
  @Output() overallStatsUpdate = new EventEmitter<PracticeModeReportOverallStats>();

  protected isLoading = true;
  protected results: ReportResultsWithOverallStats<PracticeModeReportOverallStats, PracticeModeReportByUserRecord> | null = null;

  constructor(
    private friendlyDates: FriendlyDatesService,
    private markdownHelpers: MarkdownHelpersService,
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

  protected handlePagingChange(request: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...request } });
  }

  protected showAttemptsSummary(record: PracticeModeReportByUserRecord): void {
    this.modalService.open({
      title: `${record.user.name} // ${record.challenge.name}: Attempt Summary`,
      bodyContent: `
        ##### **Challenge:** ${record.challenge.name}
        
        ###### **Maximum Possible Points:** ${record.challenge.maxPossibleScore}

        ___
        ${this.markdownHelpers.arrayToBulletList(record.attempts.map(a =>
        `**${this.friendlyDates.toFriendlyDateAndTime(a.start)}:** ${a.score} points _(${this.buildQuestionsCorrectString({
          partial: a.partiallyCorrectCount || 0,
          full: a.fullyCorrectCount || 0,
          score: a.score || 0,
          maxPossibleScore: record.challenge.maxPossibleScore
        })})_`
      ))}`,
      renderBodyAsMarkdown: true
    });
  }

  private buildQuestionsCorrectString(args: { partial: number, full: number, score: number, maxPossibleScore: number }): string {
    if (args.partial === 0 && args.full === 0)
      return "None correct";
    if (args.score >= args.maxPossibleScore && args.score > 0) {
      return "All correct";
    }

    return `${args.partial} partially correct / ${args.full} fully correct`;
  }
}
