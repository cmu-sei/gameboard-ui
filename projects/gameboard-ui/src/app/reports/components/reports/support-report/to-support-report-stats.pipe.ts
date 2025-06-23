import { Pipe, PipeTransform } from '@angular/core';
import { ReportSummaryStat } from '../../report-stat-summary/report-stat-summary.component';
import { SupportReportStatSummary } from './support-report.models';

@Pipe({
    name: 'toSupportReportStats',
    standalone: false
})
export class ToSupportReportStatsPipe implements PipeTransform {
  transform(value?: SupportReportStatSummary): ReportSummaryStat[] {
    if (!value)
      return [];

    const outStats: ReportSummaryStat[] = [
      { label: "Total Tickets", value: value.allTicketsCount, additionalInfo: "(all statuses)" },
    ];

    if (value.allTicketsMostPopularLabel) {
      outStats.push({
        label: "All Tickets: Most Common Label",
        value: value.allTicketsMostPopularLabel.label,
        additionalInfo: `${value.allTicketsMostPopularLabel.ticketCount} tickets`,
        valueSize: "small"
      });
    }

    if (value.openTicketsMostPopularLabel) {
      outStats.push({
        label: "Open Tickets: Most Common Label",
        value: value.openTicketsMostPopularLabel.label,
        additionalInfo: `${value.openTicketsMostPopularLabel.ticketCount} tickets`,
        valueSize: "small"
      });
    }

    if (value.challengeSpecWithMostTickets) {
      outStats.push({
        label: "Challenge with Most Tickets",
        value: value.challengeSpecWithMostTickets.name,
        additionalInfo: `${value.challengeSpecWithMostTickets.ticketCount} tickets`,
        valueSize: "small"
      });
    }

    return outStats;
  }
}
