import { ElementRef } from "@angular/core";
import { ReportKey, ReportMetaData } from "../reports-models";

export interface IReportComponent {
    getPdfExportElement: () => ElementRef<HTMLDivElement>;
    getReportKey(): ReportKey;
    resetParameters(): void;
    getParametersQuery(): string;
    onResultsLoaded: (metadata: ReportMetaData) => void;
}
