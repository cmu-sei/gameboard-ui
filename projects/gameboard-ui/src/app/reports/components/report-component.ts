import { ReportMetaData } from "../reports-models";

export interface IReportComponent {
    onResultsLoaded: (metadata: ReportMetaData) => void;
}
