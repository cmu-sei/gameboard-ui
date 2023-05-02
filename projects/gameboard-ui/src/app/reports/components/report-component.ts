import { ElementRef } from "@angular/core";
import { ReportKey, ReportMetaData } from "../reports-models";

export interface IReportComponent<TFlat, TStructured> {
    buildParameters(query: TFlat): TStructured;
    flattenParameters(parameters: TStructured): TFlat;
    getPdfExportElement: () => ElementRef<HTMLDivElement>;
    getReportKey(): ReportKey;
    selectedParameters?: TStructured;
    onResultsLoaded: (metadata: ReportMetaData) => void;
}
