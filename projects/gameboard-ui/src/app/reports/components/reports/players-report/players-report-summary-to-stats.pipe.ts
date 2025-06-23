import { Pipe, PipeTransform } from '@angular/core';
import { PlayersReportStatSummary } from './players-report.models';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';

@Pipe({
    name: 'playersReportSummaryToStats',
    standalone: false
})
export class PlayersReportSummaryToStatsPipe implements PipeTransform {

  transform(value?: PlayersReportStatSummary): ReportSummaryStat[] {
    if (!value)
      return [];

    return [
      { label: "Players with Deployed Competitive Challenge", value: value.usersWithDeployedCompetitiveChallengeCount },
      { label: "Players with Complete Competitive Challenge", value: value.usersWithCompletedCompetitiveChallengeCount },
      { label: "Players with Deployed Practice Challenge", value: value.usersWithDeployedPracticeChallengeCount },
      { label: "Players with Complete Practice Challenge", value: value.usersWithCompletedPracticeChallengeCount }
    ];
  }

}
