import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReportsService } from '../../../services/reports.service';
import { ReportParameterOptions, ReportParameters } from '../../reports-models';

interface ReportParametersContext {
  hasGame: boolean;
  options: ReportParameterOptions;
  selectedParameters: ReportParameters;
}

@Component({
  selector: 'app-report-parameters',
  templateUrl: './report-parameters.component.html',
  styleUrls: ['./report-parameters.component.scss']
})
export class ReportParametersComponent implements OnChanges, OnInit {
  @Input() reportKey?: string;
  @Output() reportRunRequested = new EventEmitter<ReportParameters>();

  protected parametersContext$?: Observable<ReportParametersContext>;

  constructor(private reportsService: ReportsService) { }

  ngOnInit(): void {
    this.handleReportKeyChanged(this.reportKey);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleReportKeyChanged(this.reportKey);
  }

  private handleReportKeyChanged(key?: string) {
    this.parametersContext$ = this.reportKey ? this.buildParametersContextPipe(this.reportKey) : undefined;

    if (key) {
      this.reportsService.getParameterOptions(key).subscribe(thing => console.log(thing));
    }
  }

  private buildParametersContextPipe(key: string): Observable<ReportParametersContext> {
    return this.reportsService.getParameterOptions(key).pipe(
      map(opts => ({
        hasGame: false,
        options: opts,
        selectedParameters: {}
      } as ReportParametersContext))
    )
  }
}
