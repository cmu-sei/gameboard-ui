import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { Report, ReportMetaData } from '../../reports-models';
import { DynamicReportDirective } from '../../directives/dynamic-report.directive';
import { ChallengesReportComponent } from '../challenges-report/challenges-report.component';
import { IReportComponent } from '../report-component';

@Component({
  selector: 'app-report-dynamic',
  templateUrl: './report-dynamic.component.html',
  styleUrls: ['./report-dynamic.component.scss']
})
export class ReportDynamicComponent implements AfterViewInit {
  @ViewChild(DynamicReportDirective, { read: DynamicReportDirective }) dynamicReportHost!: DynamicReportDirective;
  reportMetaData?: ReportMetaData;

  private static reportComponentMap: { [reportKey: string]: any } = {
    'challenges-report': ChallengesReportComponent
  };

  protected report$?: Observable<Report | undefined>;

  constructor(
    private reportsService: ReportsService,
    private route: ActivatedRoute) {
  }

  ngAfterViewInit(): void {
    this.report$ = this.route.params.pipe(
      switchMap(params => this.reportsService.get(params.reportSlug)),
      tap(report => {
        const viewContainerRef = this.dynamicReportHost.viewContainerRef;
        viewContainerRef.clear();

        if (report) {
          const componentRef = viewContainerRef.createComponent<IReportComponent>(ReportDynamicComponent.reportComponentMap[report.key]);
          componentRef.instance.onResultsLoaded = (metaData: ReportMetaData) => { this.reportMetaData = metaData };
        }
      })
    );
  }
}
