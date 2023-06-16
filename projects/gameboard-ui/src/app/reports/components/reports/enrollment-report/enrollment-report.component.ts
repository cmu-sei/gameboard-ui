import { Component, ElementRef, SimpleChange, ViewChild } from '@angular/core';
import { IReportComponent } from '../../report-component';
import { EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportRecord } from './enrollment-report.models';
import { ReportKey, ReportResults } from '@/reports/reports-models';
import { EnrollmentReportService } from '@/reports/services/enrollment-report.service';
import { Observable, of } from 'rxjs';
import { ReportsService } from '@/reports/reports.service';
import { SimpleEntity } from '@/api/models';

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

  constructor(public reportService: EnrollmentReportService, private reportsService: ReportsService) { }

  ngOnInit() {
    this.series$ = this.reportsService.getSeries();
    this.tracks$ = this.reportsService.getTracks();
  }

  protected displaySponsorName(s: SimpleEntity) {
    return s.name;
  }

  protected getSponsorValue(s: SimpleEntity) {
    return s.id;
  }

  private updateView(params: EnrollmentReportParameters) {
    // get data
    this.ctx$ = of({
      results: {
        metaData: {
          key: ReportKey.EnrollmentReport.toString(),
          title: "Enrollment Report",
          runAt: new Date()
        },
        records: []
      },
      selectedParameters: params
    });
  }
}
