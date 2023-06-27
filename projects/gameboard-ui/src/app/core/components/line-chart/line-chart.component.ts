import { LogService } from '@/services/log.service';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartConfigurationCustomTypesPerDataset } from 'chart.js';

export type LineChartConfig = ChartConfiguration<"line", number[], string> | ChartConfigurationCustomTypesPerDataset<"line", number[], string>;

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements AfterViewInit {
  @Input() config?: LineChartConfig;
  @ViewChild("lineChartCanvas") canvasRef?: ElementRef<HTMLCanvasElement>;

  protected chart?: Chart;

  constructor(private logService: LogService) { }

  ngAfterViewInit(): void {
    const context = this.canvasRef?.nativeElement?.getContext("2d");

    if (!context || !this.config) {
      this.logService.logError(`Couldn't obtain the canvas ref/context or configuration for a line chart:`, this.canvasRef, this.config);
      return;
    }

    this.chart = new Chart(context, this.config);
  }
  // const labels = Utils.months({ count: 7 });
  // const data = {
  //   labels: labels,
  //   datasets: [{
  //     label: 'My First Dataset',
  //     data: [65, 59, 80, 81, 56, 55, 40],
  //     fill: false,
  //     borderColor: 'rgb(75, 192, 192)',
  //     tension: 0.1
  //   }]
  // };


  // ngOnChanges(changes: SimpleChanges): void {
  //   if (this.config) {
  //     this.config.responsive = this.config.responsive || true;
  //     this.config.line = 
  //     this.config.options = this.config?.options || {
  //       responsive: true,
  //       scales: {
  //         x: {
  //           type: 'time',
  //           time: {
  //             unit: "day"
  //           },
  //           ticks: {
  //             callback: (val: any, index: number) => {
  //               console.log("val");
  //               return true;
  //             },
  //             color: "red"
  //           }
  //         },
  //       }
  //     };
  //   }
  // }
}
