import { Component, OnInit } from '@angular/core';
import { PracticeModeReportParameters, PracticeModeReportRecord } from './practice-mode-report.model';
import { ReportsService } from '@/reports/reports.service';
import { ActivatedRoute } from '@angular/router';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ReportDateRange, ReportResults } from '@/reports/reports-models';
import { QueryParamModelConfig } from '@/core/directives/query-param-model.directive';
import { PracticeModeReportService } from '@/reports/services/practice-mode-report.service';
import { Subject, firstValueFrom } from 'rxjs';
import { PagingRequest } from '@/core/components/select-pager/select-pager.component';
import { RouterService } from '@/services/router.service';

export interface PracticeModeReportContext {
  results: ReportResults<PracticeModeReportRecord>;
  selectedParameters: PracticeModeReportParameters
}

@Component({
  selector: 'app-practice-mode-report',
  templateUrl: './practice-mode-report.component.html',
  styleUrls: ['./practice-mode-report.component.scss']
})
export class PracticeModeReportComponent implements OnInit {
  // private dateQueryParamModel: QueryParamModelConfig<ReportDateRange> = {
  //   name: "practiceDate",
  //   serialize: (value) => value.dateStart!.toString(),
  //   deserialize: (queryStringValue) => ({ dateStart: new Date(queryStringValue), dateEnd: undefined }),
  // };

  selectedParameters: PracticeModeReportParameters = {
    practiceDate: undefined,
    games: [],
    series: [],
    sponsors: [],
    tracks: [],
    paging: {
      pageNumber: 0,
      pageSize: ReportsService.DEFAULT_PAGE_SIZE
    }
  };

  protected ctx$ = new Subject<PracticeModeReportContext>();

  constructor(
    private reportService: PracticeModeReportService,
    private route: ActivatedRoute,
    private routerService: RouterService,
    private unsub: UnsubscriberService) { }

  async ngOnInit(): Promise<void> {
    this.unsub.add(
      this.route.params.subscribe(async params => {
        this.selectedParameters = { ...params } as unknown as PracticeModeReportParameters;
        await this.updateView(this.selectedParameters);
      })
    );

    await this.updateView(this.selectedParameters);
  }

  protected handlePagingChange(paging: PagingRequest) {
    this.routerService.updateQueryParams({ pageNumber: paging.page, pageSize: ReportsService.DEFAULT_PAGE_SIZE });
  }

  private async updateView(parameters: PracticeModeReportParameters) {
    const data = await firstValueFrom(this.reportService.getReportData(parameters));
    this.ctx$.next({
      results: data,
      selectedParameters: parameters
    });
  }
}
