import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { ReportMetaData } from '../../reports-models';
import { ReportsService } from '../../reports.service';
import { IReportComponent } from '../report-component';
import { ChallengesReportArgs, ChallengesReportModel } from './challenges-report.models';

@Component({
  selector: 'app-challenge-report',
  templateUrl: './challenges-report.component.html',
  styleUrls: ['./challenges-report.component.scss']
})
export class ChallengesReportComponent implements IReportComponent {
  @Input() onResultsLoaded!: (metadata: ReportMetaData) => void;
  protected ctx$: Observable<ChallengesReportModel>;

  constructor(
    private route: ActivatedRoute,
    private reportsService: ReportsService) {

    this.ctx$ = this.route.queryParams.pipe(
      map(params => ({ ...params } as ChallengesReportArgs)),
      switchMap(args => reportsService.getChallengesReport(args)),
      tap(results => this.onResultsLoaded(results.metaData))
    );
  }
}
