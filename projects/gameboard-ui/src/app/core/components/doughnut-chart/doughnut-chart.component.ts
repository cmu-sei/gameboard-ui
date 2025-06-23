import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

export interface DoughnutChartConfig {
  title?: string;
  labels: string[];
  dataSets: { label: string; data: number[]; backgroundColor: string[]; hoverOffset: number; }[];
  options: { responsive: boolean; };
}

@Component({
    selector: 'app-doughnut-chart',
    imports: [CommonModule, BaseChartDirective],
    providers: [provideCharts(withDefaultRegisterables())],
    templateUrl: './doughnut-chart.component.html',
    styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent {
  @Input() config!: DoughnutChartConfig;

  constructor() {
    // trying to figure out how to pad the legend better...
    // Chart.overrides['doughnut'].plugins.legend.title.padding = 5;
    // Chart.register({
    //   id: 'paddingBelowLegends',
    //   afterUpdate: (chart, args, options) => {
    //     if (chart.legend)
    //       chart.legend.height = chart.legend.height + 50;
    //   }
    // });
  }
}
