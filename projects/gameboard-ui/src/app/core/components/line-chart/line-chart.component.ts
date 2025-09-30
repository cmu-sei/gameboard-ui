// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartConfigurationCustomTypesPerDataset, Colors, Legend, LinearScale, LineController, LineElement, PointElement, TimeScale, Tooltip } from 'chart.js';
import { LogService } from '@/services/log.service';

export type LineChartConfig = ChartConfiguration<"line", number[], string> | ChartConfigurationCustomTypesPerDataset<"line", number[], string>;

@Component({
    selector: 'app-line-chart',
    imports: [CommonModule],
    providers: [provideCharts(withDefaultRegisterables())],
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements AfterViewInit, OnChanges {
  @Input() config?: LineChartConfig;
  @ViewChild("lineChartCanvas") canvasRef?: ElementRef<HTMLCanvasElement>;

  protected chart?: Chart;

  constructor(private logService: LogService) { }

  ngAfterViewInit(): void {
    this.buildChart(this.config, this.canvasRef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const configChange = changes.config;
    if (configChange && JSON.stringify(configChange.currentValue?.data) !== JSON.stringify(configChange.previousValue?.data)) {
      this.buildChart(configChange.currentValue, this.canvasRef);
    }
  }

  private buildChart(config?: LineChartConfig, canvasRef?: ElementRef<HTMLCanvasElement>) {
    const context = canvasRef?.nativeElement?.getContext("2d");

    if (!context || !config) {
      this.logService.logInfo(`Couldn't obtain the canvas ref/context or configuration for a line chart:`, this.canvasRef, this.config);
      return;
    }

    // the fact that we have to do this suggests to me that we're not providing ng2-charts' dependencies correctly, but whatcha gonna do?
    Chart.register(Colors, Legend, LinearScale, LineController, LineElement, PointElement, TimeScale, Tooltip);
    this.chart?.destroy();
    this.chart = new Chart(context, config);
  }
}
