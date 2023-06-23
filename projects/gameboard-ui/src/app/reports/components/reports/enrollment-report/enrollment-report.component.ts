import { Component, ElementRef, ViewChild } from '@angular/core';
import { IReportComponent } from '../../report-component';
import { EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportParametersUpdate, EnrollmentReportRecord } from './enrollment-report.models';
import { ReportKey, ReportResults } from '@/reports/reports-models';
import { EnrollmentReportService } from '@/reports/services/enrollment-report.service';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ReportsService } from '@/reports/reports.service';
import { SimpleEntity } from '@/api/models';
import { RouterService } from '@/services/router.service';
import { PagingRequest } from '@/core/components/select-pager/select-pager.component';

interface EnrollmentReportContext {
  results: ReportResults<EnrollmentReportRecord>;
  selectedParameters: EnrollmentReportParameters;
}

@Component({
  selector: 'app-enrollment-report',
  templateUrl: './enrollment-report.component.html',
  styleUrls: ['./enrollment-report.component.scss']
})
export class EnrollmentReportComponent
  implements IReportComponent<EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportRecord> {
  @ViewChild("enrollmentReport") reportContainer!: ElementRef<HTMLDivElement>;

  ctx$?: Observable<EnrollmentReportContext>;
  seasons$: Observable<string[]> = this.reportsService.getSeasons();
  series$: Observable<string[]> = this.reportsService.getSeries();
  sponsors$: Observable<SimpleEntity[]> = this.reportsService.getSponsors();
  tracks$: Observable<string[]> = this.reportsService.getTracks();

  private _selectedParameters: EnrollmentReportParameters = {
    enrollDate: {},
    paging: { pageSize: ReportsService.DEFAULT_PAGE_SIZE, pageNumber: 0 },
    seasons: [],
    series: [],
    sponsors: [],
    tracks: []
  };
  public get selectedParameters(): EnrollmentReportParameters { return this._selectedParameters; }
  public set selectedParameters(value: EnrollmentReportParameters) {
    this._selectedParameters = value;
    this.updateView(value);
  }

  getPdfExportElement = () => this.reportContainer;
  getReportKey = () => ReportKey.EnrollmentReport;

  constructor(
    public reportService: EnrollmentReportService,
    private reportsService: ReportsService,
    private routerService: RouterService) { }

  protected buildParameterChangeUrl(parameterBuilder: EnrollmentReportParametersUpdate) {
    const updatedSelectedParameters: EnrollmentReportFlatParameters = this.reportService.flattenParameters({ ...this.selectedParameters, ...parameterBuilder });
    return this.routerService.getReportRoute(ReportKey.EnrollmentReport, updatedSelectedParameters);
  }

  protected displaySponsorName(s: SimpleEntity) {
    return s.name;
  }

  protected getSponsorValue(s: SimpleEntity) {
    return s.id;
  }

  protected handlePagingChange(paging: PagingRequest) {
    const parameterChangeUrl = this.buildParameterChangeUrl({ paging: { pageNumber: paging.page, pageSize: ReportsService.DEFAULT_PAGE_SIZE } });
    this.routerService.router.navigateByUrl(parameterChangeUrl);
  }

  private async updateView(params: EnrollmentReportParameters) {
    // get data
    this.ctx$ = of({
      results: await firstValueFrom(this.reportService.getReportData(params)),
      selectedParameters: params
    });
  }
}
