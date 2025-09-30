// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { SupportReportFlatParameters, SupportReportRecord, SupportReportStatSummary } from './support-report.models';
import { ReportResultsWithOverallStats, ReportViewUpdate } from '../../../reports-models';
import { firstValueFrom } from 'rxjs';
import { SupportReportService } from '@/reports/components/reports/support-report/support-report.service';
import { DoughnutChartConfig } from '@/core/components/doughnut-chart/doughnut-chart.component';
import { groupBy } from '@/../tools/tools';
import { TextToRgbService } from '@/services/text-to-rgb.service';
import { SupportService } from '@/api/support.service';
import { FontAwesomeService } from '@/services/font-awesome.service';
import { ReportComponentBase } from '../report-base.component';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';
import { TimespanQueryParamModel } from '@/core/models/timespan-query-param-model';
import { GameChallengeSpecQueryModel } from '@/core/models/game-challenge-spec-query-param.model';

interface SupportReportContext {
  results: ReportResultsWithOverallStats<SupportReportStatSummary, SupportReportRecord>,
  challengesChartConfig: DoughnutChartConfig,
  labelsChartConfigs: DoughnutChartConfig[],
  statusChartConfig: DoughnutChartConfig
}

@Component({
    selector: 'app-support-report',
    templateUrl: './support-report.component.html',
    styleUrls: ['./support-report.component.scss'],
    standalone: false
})
export class SupportReportComponent extends ReportComponentBase<SupportReportFlatParameters> {
  protected ticketLabels$ = this.reportService.getTicketLabels();
  protected ticketStatuses$ = this.reportService.getTicketStatuses();

  protected gameChallengeSpecQueryModel: GameChallengeSpecQueryModel | null = new GameChallengeSpecQueryModel();
  protected openedDateRangeModel: DateRangeQueryParamModel | null = null;
  protected updatedDateRangeModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "updatedDateStart",
    dateEndParamName: "updatedDateEnd"
  });

  protected labelsQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "labels",
    options: firstValueFrom(this.ticketLabels$)
  });

  protected statusesQueryModel: MultiSelectQueryParamModel<string> | null = new MultiSelectQueryParamModel<string>({
    paramName: "statuses",
    options: firstValueFrom(this.ticketStatuses$)
  });

  protected openedTimeSpanQueryModel: TimespanQueryParamModel | null = new TimespanQueryParamModel({ paramName: "minutesSinceOpen" });
  protected updatedTimeSpanQueryModel: TimespanQueryParamModel | null = new TimespanQueryParamModel({ paramName: "minutesSinceUpdate" });

  protected isLoading = false;
  ctx?: SupportReportContext;

  constructor(
    protected faService: FontAwesomeService,
    private reportService: SupportReportService,
    private rgbService: TextToRgbService,
    private supportService: SupportService) {
    super();

    this.openedDateRangeModel = new DateRangeQueryParamModel({
      dateStartParamName: "openedDateStart",
      dateEndParamName: "openedDateEnd"
    });

    this.unsub.add(
      this.activeReportService.parametersReset$.subscribe(() => {
        this.statusesQueryModel!.searchText = undefined;
        this.labelsQueryModel!.searchText = undefined;
      })
    );
  }

  async updateView(parameters: SupportReportFlatParameters): Promise<ReportViewUpdate> {
    this.isLoading = true;
    const results = await firstValueFrom(this.reportService.getReportData(parameters));
    const labels = await firstValueFrom(this.supportService.listLabels());
    this.isLoading = false;

    this.ctx = {
      results,
      challengesChartConfig: this.buildTicketsByGameAndChallenge(results.records),
      labelsChartConfigs: this.buildTicketsByLabel(results.records, labels),
      statusChartConfig: this.buildTicketsByStatus(results.records)
    };

    return {
      metaData: results.metaData
    };
  }

  private buildTicketsByStatus(records: SupportReportRecord[]): DoughnutChartConfig {
    const open = records.filter(r => r.status.toLowerCase() == 'open').length;
    const closed = records.filter(r => r.status.toLowerCase() == 'closed').length;
    const inProg = records.filter(r => r.status.toLowerCase() == 'in progress').length;
    const other = records.filter(r => r.status == 'other').length;

    const labels = ["Closed", "In Progress", "Open"];
    const dataSets = [{
      label: "Statuses",
      data: [
        closed,
        inProg,
        open
      ]
    }];

    if (other) {
      labels.push("Other");
      dataSets[0].data.push(other);
    }

    return {
      labels,
      dataSets: [{
        label: 'Statuses',
        data: [
          closed,
          inProg,
          open,
          other
        ],
        backgroundColor: [
          'rgb(0, 255, 0)',
          'rgb(0, 0, 255)',
          'rgb(255, 0 , 0)',
          'rgb(165, 29, 200)'
        ],
        hoverOffset: 4
      }],
      options: {
        responsive: true
      }
    };
  }

  private buildTicketsByGameAndChallenge(records: SupportReportRecord[]): DoughnutChartConfig {
    const gameChallenges = records
      .filter(r => r.game && r.challenge)
      .map(r => ({
        gameAndChallenge: `${r.game!.name} // ${r.challenge!.name}`,
        ticketKey: r.prefixedKey,
      }));

    const groupedTickets = groupBy(gameChallenges, r => r.gameAndChallenge);
    const labels = Array.from(groupedTickets.keys());
    const colors = labels.map(l => this.rgbService.getAsRgbString(l));

    return {
      labels,
      dataSets: [{
        label: "Challenges",
        data: Array.from(groupedTickets.values()).map(v => v.length),
        backgroundColor: colors,
        hoverOffset: 4
      }],
      options: {
        responsive: true
      }
    };
  }

  private buildTicketsByLabel(records: SupportReportRecord[], labels: string[]): DoughnutChartConfig[] {
    const labelCounts: { [label: string]: number } = {};
    const totalRecords = records.length;
    const retVal: DoughnutChartConfig[] = [];

    for (let record of records) {
      for (let label of record.labels) {
        if (labelCounts[label])
          labelCounts[label] += 1;
        else
          labelCounts[label] = 1;
      }
    }

    for (let label in labelCounts) {
      retVal.push({
        title: label,
        labels: [
          `"${label}" tickets`,
          "Other tickets"
        ],
        dataSets: [{
          label: "Tickets",
          data: [
            labelCounts[label],
            totalRecords - labelCounts[label]
          ],
          backgroundColor: [
            "rgb(0, 0, 256)",
            "rgb(200, 200, 200)"
          ],
          hoverOffset: 4
        }],
        options: {
          responsive: true
        }
      });
    }

    return retVal;
  }
}
