import { ElementRef } from "@angular/core";
import { ReportKey, ReportMetaData } from "../reports-models";

export interface IReportComponent<T> {
    getPdfExportElement: () => ElementRef<HTMLDivElement>;
    getParametersQuery(): string;
    getReportKey(): ReportKey;
    resetParameters(): void;
    selectedParameters?: T;
    onResultsLoaded: (metadata: ReportMetaData) => void;
}
