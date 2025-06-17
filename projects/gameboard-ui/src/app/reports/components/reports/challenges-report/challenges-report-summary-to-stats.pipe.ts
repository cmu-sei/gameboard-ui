import { Pipe, PipeTransform } from '@angular/core';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';
import { ChallengesReportStatSummary } from './challenges-report.models';

@Pipe({
    name: 'challengesReportSummaryToStats',
    standalone: false
})
export class ChallengesReportSummaryToStatsPipe implements PipeTransform {
  transform(stats: ChallengesReportStatSummary): ReportSummaryStat[] {
    if (!stats)
      return [];

    const outStats: ReportSummaryStat[] = [
      { label: "Competitive Challenge Attempts", value: stats.deployCompetitiveCount },
      { label: "Practice Challenge Attempts", value: stats.deployPracticeCount },
    ];

    if (stats.mostPopularCompetitiveChallenge) {
      outStats.push({ label: "Attempts On Most Popular Competitive Challenge", value: stats.mostPopularCompetitiveChallenge.deployCount, additionalInfo: `"${stats.mostPopularCompetitiveChallenge.challengeName}"` });
    }

    if (stats.mostPopularPracticeChallenge) {
      outStats.push({ label: "Attempts on Most Popular Practice Challenge", value: stats.mostPopularPracticeChallenge.deployCount, additionalInfo: `"${stats.mostPopularPracticeChallenge.challengeName}"` });
    }

    return outStats;
  }
}
