import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EnrollmentReportFlatParameters, EnrollmentReportRecord } from '../enrollment-report.models';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ReportResults } from '@/reports/reports-models';
import { PagingArgs } from '@/api/models';
import { RouterService } from '@/services/router.service';
import { EnrollmentReportService } from '../enrollment-report.service';

interface EnrollmentReportSummaryContext {
  results: ReportResults<EnrollmentReportRecord>;
}

@Component({
    selector: 'app-enrollment-report-summary',
    templateUrl: './enrollment-report-summary.component.html',
    styleUrls: ['./enrollment-report-summary.component.scss'],
    standalone: false
})
export class EnrollmentReportSummaryComponent implements OnChanges {
  @Input() parameters: EnrollmentReportFlatParameters | null = null;

  protected ctx?: EnrollmentReportSummaryContext;
  protected isLoading = false;

  constructor(
    private enrollmentReportService: EnrollmentReportService,
    private markdownHelpersService: MarkdownHelpersService,
    private modalService: ModalConfirmService,
    private routerService: RouterService
  ) { }

  async ngOnChanges(changes: SimpleChanges) {
    if (!changes.parameters)
      return;

    this.isLoading = true;
    this.ctx = {
      results: await firstValueFrom(this.enrollmentReportService.getReportData(this.parameters || {}))
    };
    this.isLoading = false;
  }

  protected handlePagingChange(request: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...request } });
  }

  protected showChallengesDetail(record: EnrollmentReportRecord, challengeStatus: "deployed" | "partial" | "complete") {
    let challenges: { name: string, score?: number, maxPossiblePoints: number }[] = [];

    switch (challengeStatus) {
      case "partial":
        challenges = record.challenges.filter(c => c.result == "partial");
        break;
      case "complete":
        challenges = record.challenges.filter(c => c.result == "success");
        break;
      default:
        challenges = record.challenges;
    }

    this.modalService.open({
      bodyContent: this
        .markdownHelpersService
        .arrayToBulletList(challenges.map(c => `${c.name} (${c.score || "--"}/${c.maxPossiblePoints}) possible points`)),
      renderBodyAsMarkdown: true,
      title: `${record.player.name}: Challenges ${challengeStatus.substring(0, 1).toUpperCase()}${challengeStatus.substring(1)}`,
    });
  }

  protected showScoreBreakdown(record: EnrollmentReportRecord) {
    const scoreItems: { points: number, source: string }[] = [];

    for (const challenge of record.challenges) {
      if (challenge.score)
        scoreItems.push({ points: challenge.score, source: `**${challenge.name}**, ${challenge.result.toString()} solve` });

      if (challenge.manualChallengeBonuses?.length) {
        for (const bonus of challenge.manualChallengeBonuses) {
          scoreItems.push({ points: bonus.points, source: `**Manual bonus**, ${bonus.description}` });
        }
      }
    }

    this.modalService.open({
      bodyContent: this
        .markdownHelpersService
        .arrayToBulletList(scoreItems.map(i => `${i.points} (${i.source})`)),
      renderBodyAsMarkdown: true,
      title: `${record.player.name}: Score Breakdown`
    });
  }
}
