import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ReportParameterOptions, ReportParameters } from '../../reports-models';

interface ReportParametersContext {
  options: ReportParameterOptions;
  selections: ReportParameters;
}

@Component({
  selector: 'app-report-parameters',
  templateUrl: './report-parameters.component.html',
  styleUrls: ['./report-parameters.component.scss']
})
export class ReportParametersComponent implements OnChanges, OnInit {
  @Input() reportKey?: string;
  @Output() reportRunRequested = new EventEmitter<ReportParameters>();

  // TODO: not this
  private static DEFAULT_NEW_PARAMETERS: ReportParameters = { dateRange: {} }
  private reportKey$ = new BehaviorSubject<string | undefined>(undefined);
  private selectedParameters$ = new BehaviorSubject<ReportParameters>(ReportParametersComponent.DEFAULT_NEW_PARAMETERS);
  protected parametersContext$?: Observable<ReportParametersContext | null>;

  constructor(private reportsService: ReportsService) { }

  ngOnInit(): void {
    this.parametersContext$ = combineLatest([
      this.reportKey$,
      this.selectedParameters$
    ]).pipe(
      switchMap(([reportKey, selectedParameters]) => !reportKey ? of(null) : forkJoin({
        selections: of(selectedParameters),
        options: this.reportsService.getParameterOptions(reportKey, selectedParameters)
      }))
    );

    this.reportKey$.next(this.reportKey);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reportKey$.next(this.reportKey);
  }

  handleClearSelections(): void {
    this.selectedParameters$.next(ReportParametersComponent.DEFAULT_NEW_PARAMETERS);
  }

  handleModelChange(thing: any): void {
    console.log(this.selectedParameters$.value);
  }
}
