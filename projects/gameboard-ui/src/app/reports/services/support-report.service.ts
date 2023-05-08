import { Injectable } from '@angular/core';
import { SupportReportFlatParameters, SupportReportParameters, SupportReportRecord } from '../components/reports/support-report/support-report.models';
import { ObjectService } from '../../services/object.service';
import { Observable } from 'rxjs';
import { ReportResults } from '../reports-models';
import { UriService } from '../../services/uri.service';
import { HttpClient } from '@angular/common/http';
import { ApiUrlService } from '../../services/api-url.service';
import { IReportService } from './ireport.service';

@Injectable({ providedIn: 'root' })
export class SupportReportService implements IReportService<SupportReportFlatParameters, SupportReportParameters, SupportReportRecord> {

  constructor(
    private apiRoot: ApiUrlService,
    private http: HttpClient,
    private objectService: ObjectService,
    private uriService: UriService) { }

  public flattenParameters(parameters: SupportReportParameters) {
    let flattened: SupportReportFlatParameters = {
      openedDateStart: parameters.openedDateRange?.dateStart?.toLocaleDateString(),
      openedDateEnd: parameters.openedDateRange?.dateEnd?.toLocaleDateString(),
      ...parameters
    };

    flattened = this.objectService.deleteKeys(flattened, "openedDateRange");
    return flattened;
  }

  public unflattenParameters(parameters: SupportReportFlatParameters) {
    const structured: SupportReportParameters = {
      openedDateRange: {
        dateStart: parameters.openedDateStart ? new Date(parameters.openedDateStart) : undefined,
        dateEnd: parameters.openedDateEnd ? new Date(parameters.openedDateEnd) : undefined
      },
      ...parameters
    };

    this.objectService.deleteKeys(structured, "openedDateStart", "openedDateEnd");
    return structured;
  }

  getReportData(args: SupportReportParameters): Observable<ReportResults<SupportReportRecord>> {
    const flattened = this.flattenParameters(args);
    const query = this.uriService.toQueryString(flattened);
    return this.http.get<ReportResults<SupportReportRecord>>(`${this.apiRoot.build(`/reports/support-report${query}`)}`);
  }
}
