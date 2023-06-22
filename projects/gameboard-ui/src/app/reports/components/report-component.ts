import { ElementRef } from "@angular/core";
import { ReportKey, ReportMetaData } from "../reports-models";
import { IReportService } from "../services/ireport.service";

export interface IReportComponent<TFlat, TStructured, TReportData> {
    getPdfExportElement: () => ElementRef<HTMLDivElement>;
    getReportKey(): ReportKey;
    enrollmentReportService: IReportService<TFlat, TStructured, TReportData>;
    selectedParameters?: TStructured;
}
