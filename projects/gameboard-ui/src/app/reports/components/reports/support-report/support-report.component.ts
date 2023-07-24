import { Component, ElementRef, ViewChild } from '@angular/core';
import { SupportReportFlatParameters, SupportReportParameters, SupportReportRecord } from './support-report.models';
import { ReportDateRange, ReportResults, ReportTimeSpan, ReportViewUpdate } from '../../../reports-models';
import { firstValueFrom } from 'rxjs';
import { SupportReportService } from '@/reports/services/support-report.service';
import { DoughnutChartConfig } from '@/core/components/doughnut-chart/doughnut-chart.component';
import { groupBy } from 'projects/gameboard-ui/src/tools';
import { TextToRgbService } from '@/services/text-to-rgb.service';
import { SupportService } from '@/api/support.service';
import { FontAwesomeService } from '@/services/font-awesome.service';
import { ReportComponentBase } from '../report-base.component';
import { QueryParamModelConfig, getDateRangeQueryModelConfig, getStringArrayQueryModelConfig } from '@/core/directives/query-param-model.directive';
import { ParameterDateRangeComponent } from '../../parameters/parameter-date-range/parameter-date-range.component';
import { MultiSelectComponent } from '@/core/components/multi-select/multi-select.component';
import { ParameterTimespanPickerComponent } from '../../parameters/parameter-timespan-picker/parameter-timespan-picker.component';
import { QueryParamModelService } from '@/core/directives/query-param-model.service';
import { ParameterGameChallengespecComponent, ReportGameChallengeSpec } from '../../parameters/parameter-game-challengespec/parameter-game-challengespec.component';

interface SupportReportContext {
  results: ReportResults<SupportReportRecord>,
  challengesChartConfig: DoughnutChartConfig,
  labelsChartConfigs: DoughnutChartConfig[],
  statusChartConfig: DoughnutChartConfig
}

@Component({
  selector: 'app-support-report',
  templateUrl: './support-report.component.html',
  styleUrls: ['./support-report.component.scss']
})
export class SupportReportComponent extends ReportComponentBase<SupportReportFlatParameters, SupportReportParameters> {
  @ViewChild("supportReport") reportElementRef?: ElementRef<HTMLDivElement>;

  protected ticketLabels$ = this.reportService.getTicketLabels();
  protected ticketStatuses$ = this.reportService.getTicketStatuses();

  protected gameChallengeSpecQueryModel?: QueryParamModelConfig<ReportGameChallengeSpec>;
  @ViewChild("gameChallengeSpec") set gameChallengeSpec(component: ParameterGameChallengespecComponent) {
    if (component) {
      this.gameChallengeSpecQueryModel = this.queryParamModelService.getGameChallengeSpecQueryModelConfig({
        gameIdParamName: "gameId",
        challengeSpecIdParamName: "challengeSpecId",
        emitter: component.ngModelChange
      });
    }
  }

  protected openedDateRangeQueryModel?: QueryParamModelConfig<ReportDateRange>;
  @ViewChild("openedDateRange") set enrollmentDateRange(component: ParameterDateRangeComponent) {
    if (component) {
      this.openedDateRangeQueryModel = getDateRangeQueryModelConfig({
        propertyNameMap: [
          { propertyName: "dateStart", queryStringParamName: "openedDateStart" },
          { propertyName: "dateEnd", queryStringParamName: "openedDateEnd" }
        ],
        emitter: component.ngModelChange
      });
    }
  }

  protected labelsQueryModel?: QueryParamModelConfig<string[]>;
  @ViewChild('labelsMulti') set labelsMultiSelect(component: MultiSelectComponent<string>) {
    if (component) {
      this.labelsQueryModel = getStringArrayQueryModelConfig("labels", component.ngModelChange);
    }
  }

  protected statusQueryModel?: QueryParamModelConfig<string[]>;
  @ViewChild('statusMulti') set statusesMultiSelect(component: MultiSelectComponent<string>) {
    if (component) {
      this.statusQueryModel = getStringArrayQueryModelConfig("statuses", component.ngModelChange);
    }
  }

  protected openedTimeSpanQueryModel?: QueryParamModelConfig<ReportTimeSpan>;
  @ViewChild("openedTimeSpan") set openedTimeSpan(component: ParameterTimespanPickerComponent) {
    if (component) {
      this.openedTimeSpanQueryModel = this.queryParamModelService.getTimeSpanQueryModelConfig("minutesSinceOpen", component.ngModelChange);
    }
  }

  protected updatedTimeSpanQueryModel?: QueryParamModelConfig<ReportTimeSpan>;
  @ViewChild("updatedTimeSpan") set updatedTimeSpan(component: ParameterTimespanPickerComponent) {
    if (component) {
      this.updatedTimeSpanQueryModel = this.queryParamModelService.getTimeSpanQueryModelConfig("minutesSinceUpdate", component.ngModelChange);
    }
  }

  protected isLoading = false;
  ctx?: SupportReportContext;

  constructor(
    protected faService: FontAwesomeService,
    private queryParamModelService: QueryParamModelService,
    private reportService: SupportReportService,
    private rgbService: TextToRgbService,
    private supportService: SupportService) { super(); }

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
      metaData: results.metaData,
      reportContainerRef: this.reportElementRef,
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
