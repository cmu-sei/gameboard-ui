import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { LogService } from '@/services/log.service';
import { Chart, ChartConfiguration, ChartConfigurationCustomTypesPerDataset } from 'chart.js';

export type LineChartConfig = ChartConfiguration<"line", number[], string> | ChartConfigurationCustomTypesPerDataset<"line", number[], string>;

@Component({
  selector: 'app-line-chart',
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

    this.chart?.destroy();
    this.chart = new Chart(context, config);
  }
}
