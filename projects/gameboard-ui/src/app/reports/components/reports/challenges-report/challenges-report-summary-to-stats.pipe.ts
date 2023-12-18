import { Pipe, PipeTransform } from '@angular/core';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';
import { ChallengesReportStatSummary } from './challenges-report.models';

@Pipe({ name: 'challengesReportSummaryToStats' })
export class ChallengesReportSummaryToStatsPipe implements PipeTransform {

  transform(stats: ChallengesReportStatSummary): ReportSummaryStat[] {
    if (!stats)
      return [];

    const outStats: ReportSummaryStat[] = [
      { label: "Challenge Attempt", value: stats.deployCount }
    ];

    if (stats.archivedDeployCount > 0) {
      outStats.push({ label: "Archived Attempt", value: stats.archivedDeployCount });
    }

    if (stats.mostPopularCompetitiveChallenge) {
      outStats.push({ label: "Most Popular Competitive Challenge", value: stats.mostPopularCompetitiveChallenge.challengeName, additionalInfo: `${stats.mostPopularCompetitiveChallenge.deployCount} attempts` });
    }

    if (stats.mostPopularPracticeChallenge) {
      outStats.push({ label: "Most Popular Practice Challenge", value: stats.mostPopularPracticeChallenge.challengeName, additionalInfo: `${stats.mostPopularPracticeChallenge.deployCount} attempts` });
    }

    return outStats;
  }
}
