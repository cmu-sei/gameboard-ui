import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { ReportViewUpdate } from "../../reports-models";
import { ActiveReportService } from "../../services/active-report.service";
import { PagingArgs } from "@/api/models";
import { ReportsService } from "@/reports/reports.service";
import { ActivatedRoute } from "@angular/router";
import { UnsubscriberService } from "@/services/unsubscriber.service";
import { ObjectService } from "@/services/object.service";

@Component({ template: '', providers: [UnsubscriberService] })
export abstract class ReportComponentBase<TFlatParameters extends {}, TStructuredParameters extends {}> implements OnInit {
    // manually injected services (so the inheritors don't have to resolve dependencies)
    protected readonly activeReportService = inject(ActiveReportService);
    protected readonly reportsService = inject(ReportsService);
    protected readonly route = inject(ActivatedRoute);
    protected readonly unsub = inject(UnsubscriberService);
    protected readonly objectService = inject(ObjectService);

    constructor() {
        this.unsub.add(this.route.queryParams.subscribe(params => {
            this._updateView({ ...params } as TFlatParameters);
        }));
    }

    ngOnInit(): void {
        this._updateView({ ...this.route.snapshot.queryParams } as TFlatParameters);
    }

    protected abstract getDefaultParameters(defaultPaging: PagingArgs): TStructuredParameters;
    protected abstract updateView(parameters: TFlatParameters): Promise<ReportViewUpdate>;

    private async _updateView(parameters: TFlatParameters) {
        const viewUpdate = await this.updateView(parameters);
        this.activeReportService.parametersPristine = true;
        this.activeReportService.metaData$.next(viewUpdate.metaData);
        this.activeReportService.htmlElement$.next(viewUpdate.reportContainerRef);
    }
}
