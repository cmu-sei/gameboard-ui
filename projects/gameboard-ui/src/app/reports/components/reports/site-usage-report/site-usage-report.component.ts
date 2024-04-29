import { Component } from '@angular/core';
import { SiteUsageReportService } from './site-usage-report.service';
import { SiteUsageReport, SiteUsageReportFlatParameters } from './site-usage-report.models';
import { ReportComponentBase } from '../report-base.component';
import { ReportKey, ReportViewUpdate } from '@/reports/reports-models';
import { MetadataService } from 'oidc-client-ts';
import { firstValueFrom } from 'rxjs';
import { DateRangeQueryParamModel } from '@/core/models/date-range-query-param.model';

@Component({
  selector: 'app-site-usage-report',
  templateUrl: './site-usage-report.component.html',
  styleUrls: ['./site-usage-report.component.scss']
})
export class SiteUsageReportComponent extends ReportComponentBase<SiteUsageReportFlatParameters> {
  protected reportData?: SiteUsageReport;
  protected dateQueryModel: DateRangeQueryParamModel | null = new DateRangeQueryParamModel({
    dateStartParamName: "startDate",
    dateEndParamName: "endDate"
  });

  constructor(private reportService: SiteUsageReportService) {
    super();
  }

  protected async updateView(parameters: SiteUsageReportFlatParameters): Promise<ReportViewUpdate> {
    this.reportData = await this.reportService.get(parameters);

    return {
      metaData: await firstValueFrom(this.reportsService.getReportMetaData(ReportKey.SiteUsageReport)),
    };
  }
}
