import { Injectable } from '@angular/core';
import { IReportService } from './ireport.service';
import { EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportRecord } from '../components/reports/enrollment-report/enrollment-report.models';
import { Observable } from 'rxjs';
import { ReportResults } from '../reports-models';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentReportService
  implements IReportService<EnrollmentReportFlatParameters, EnrollmentReportParameters, EnrollmentReportRecord> {

  constructor() { }

  flattenParameters(parameters: EnrollmentReportParameters): EnrollmentReportFlatParameters {
    return {
      enrollDateEnd: parameters.enrollDate?.dateEnd,
      enrollDateStart: parameters.enrollDate?.dateStart,
      seasons: parameters.seasons || [],
      series: parameters.series || [],
      sponsors: parameters.sponsors || [],
      tracks: parameters.tracks || []
    }
  }

  unflattenParameters(parameters: EnrollmentReportFlatParameters): EnrollmentReportParameters {
    return {
      enrollDate: {
        dateStart: parameters.enrollDateStart,
        dateEnd: parameters.enrollDateEnd
      },
      seasons: parameters.seasons || [],
      series: parameters.series || [],
      sponsors: parameters.sponsors || [],
      tracks: parameters.tracks || []
    }
  }

  getReportData(parameters: EnrollmentReportParameters): Observable<ReportResults<EnrollmentReportRecord>> {
    throw new Error('Method not implemented.');
  }
}
