import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IReportComponent } from '../../report-component';
import { SupportReportFlatParameters, SupportReportParameters, SupportReportRecord } from './support-report.models';
import { ReportDateRange, ReportKey, ReportMetaData, ReportResults } from '../../../reports-models';
import { createCustomInputControlValueAccessor } from '../../parameters/report-parameter-component';
import { ObjectService } from 'projects/gameboard-ui/src/app/services/object.service';

@Component({
  selector: 'app-support-report',
  templateUrl: './support-report.component.html',
  styleUrls: ['./support-report.component.scss'],
  providers: [createCustomInputControlValueAccessor(SupportReportComponent)]
})
export class SupportReportComponent implements IReportComponent<SupportReportFlatParameters, SupportReportParameters> {
  @Input() onResultsLoaded!: (metadata: ReportMetaData) => void;
  selectedParameters: SupportReportParameters = { openedDateRange: {} };
  ctx?: ReportResults<SupportReportRecord>;

  @ViewChild("supportReport") reportElementRef?: ElementRef<HTMLDivElement>;

  constructor(private objectService: ObjectService) { }

  getPdfExportElement() {
    return this.reportElementRef!;
  }

  getReportKey(): ReportKey {
    return ReportKey.SupportReport;
  }

  buildParameters(query: SupportReportFlatParameters): SupportReportParameters {
    const structured: SupportReportParameters = {
      openedDateRange: {
        dateStart: query.openedDateStart ? new Date(query.openedDateStart) : undefined,
        dateEnd: query.openedDateEnd ? new Date(query.openedDateEnd) : undefined
      },
      ...query
    };

    this.objectService.deleteKeys(structured, "openedDateStart", "openedDateEnd");

    return structured;
  }

  flattenParameters(parameters: SupportReportParameters): SupportReportFlatParameters {
    const flattened: SupportReportFlatParameters = {
      openedDateStart: parameters.openedDateRange?.dateStart?.toLocaleDateString(),
      openedDateEnd: parameters.openedDateRange?.dateEnd?.toLocaleDateString(),
      ...parameters
    };

    this.objectService.deleteKeys(flattened, "openedDateRange");

    return flattened;
  }
}
