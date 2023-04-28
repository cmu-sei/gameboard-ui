import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subscription, map, switchMap, tap } from 'rxjs';
import { PlayersReportParameters, PlayersReportResults } from './players-report.models';
import { ReportsService } from '../../reports.service';
import { ActivatedRoute } from '@angular/router';
import { ReportKey, ReportMetaData } from '../../reports-models';
import { IReportComponent } from '../report-component';
import { UriService } from '../../../services/uri.service';

interface PlayersReportContext {
  results$: PlayersReportResults;
  selectedParameters: PlayersReportParameters;
}

@Component({
  selector: 'app-players-report',
  templateUrl: './players-report.component.html',
  styleUrls: ['./players-report.component.scss']
})
export class PlayersReportComponent implements IReportComponent<PlayersReportParameters>, OnInit {
  @Input() onResultsLoaded!: (metadata: ReportMetaData) => void;
  ctx$?: Observable<PlayersReportResults>;
  selectedParameters: PlayersReportParameters = {};

  // have to do wackiness because the viewchild of interest is inside a structural directive ("if")
  @ViewChildren('playersReport', { read: ElementRef<HTMLDivElement> }) protected viewContainerRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private reportElementRef?: ElementRef<HTMLDivElement>;
  private viewContainerRefsSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private uriService: UriService,
    reportsService: ReportsService) {
    this.ctx$ = this.route.queryParams.pipe(
      map(params => ({ ...params } as PlayersReportParameters)),
      switchMap(args => reportsService.getPlayersReport(args)),
      tap(results => this.onResultsLoaded(results.metaData)),
    );
  }

  ngOnInit(): void {
    console.log("selected params are", this.selectedParameters);
  }

  getPdfExportElement(): ElementRef<HTMLDivElement> {
    return this.reportElementRef!;
  }

  getParametersQuery(): string {
    return this.uriService.toQueryString(this.selectedParameters);
  }

  getReportKey(): ReportKey {
    return ReportKey.PlayersReport;
  }

  handleParametersChanged(event: any) {
    console.log("selected params:", this.selectedParameters)
  }

  resetParameters(): void {
    this.selectedParameters = {};
  }
}
