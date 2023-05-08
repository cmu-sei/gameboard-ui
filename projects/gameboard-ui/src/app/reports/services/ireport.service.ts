import { Observable } from "rxjs";
import { ReportResults } from "../reports-models";

export interface IReportService<TFlattenedParameters, TStructuredParameters, TReportData> {
    flattenParameters(parameters: TStructuredParameters): TFlattenedParameters;
    unflattenParameters(parameters: TFlattenedParameters): TStructuredParameters;
    getReportData(parameters: TStructuredParameters): Observable<ReportResults<TReportData>>
}
