import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IReportComponent } from '../../report-component';
import { SupportReportFlatParameters, SupportReportParameters, SupportReportRecord } from './support-report.models';
import { ReportKey, ReportMetaData, ReportResults } from '../../../reports-models';
import { createCustomInputControlValueAccessor } from '../../parameters/report-parameter-component';
import { firstValueFrom } from 'rxjs';
import { SupportReportService } from '../../../services/support-report.service';
import { DoughnutChartConfig } from '@/core/components/doughnut-chart/doughnut-chart.component';
import { groupBy } from 'projects/gameboard-ui/src/tools';
import { TextToRgbService } from '@/services/text-to-rgb.service';
import { SupportService } from '@/api/support.service';
import { FontAwesomeService } from '@/services/font-awesome.service';

interface SupportReportContext {
  results: ReportResults<SupportReportRecord>,
  challengesChartConfig: DoughnutChartConfig,
  labelsChartConfigs: DoughnutChartConfig[],
  statusChartConfig: DoughnutChartConfig
}

@Component({
  selector: 'app-support-report',
  templateUrl: './support-report.component.html',
  styleUrls: ['./support-report.component.scss'],
  providers: [createCustomInputControlValueAccessor(SupportReportComponent)]
})
export class SupportReportComponent implements OnInit, IReportComponent<SupportReportFlatParameters, SupportReportParameters, SupportReportRecord> {
  @Input() onResultsLoaded!: (metadata: ReportMetaData) => void;
  selectedParameters: SupportReportParameters = {
    gameChallengeSpec: {},
    labels: [],
    openedDateRange: {},
    timeSinceOpen: {},
    timeSinceUpdate: {},
  };
  ctx?: SupportReportContext;

  @ViewChild("supportReport") reportElementRef?: ElementRef<HTMLDivElement>;

  constructor(
    public faService: FontAwesomeService,
    public reportService: SupportReportService,
    private rgbService: TextToRgbService,
    private supportService: SupportService) { }

  async ngOnInit() {
    const results = await firstValueFrom(this.reportService.getReportData(this.selectedParameters));
    const labels = await firstValueFrom(this.supportService.listLabels());

    this.ctx = {
      results,
      challengesChartConfig: this.buildTicketsByGameAndChallenge(results.records),
      labelsChartConfigs: this.buildTicketsByLabel(results.records, labels),
      statusChartConfig: this.buildTicketsByStatus(results.records)
    }
  }

  getPdfExportElement() {
    return this.reportElementRef!;
  }

  getReportKey(): ReportKey {
    return ReportKey.SupportReport;
  }

  private buildTicketsByStatus(records: SupportReportRecord[]): DoughnutChartConfig {
    const open = records.filter(r => r.status.toLowerCase() == 'open').length;
    const closed = records.filter(r => r.status.toLowerCase() == 'closed').length;
    const inProg = records.filter(r => r.status.toLowerCase() == 'in progress').length;
    const other = records.filter(r => r.status == 'other').length;

    return {
      labels: [
        'Closed',
        'In Progress',
        'Open',
        'Other'
      ],
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
    }
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
    }
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
