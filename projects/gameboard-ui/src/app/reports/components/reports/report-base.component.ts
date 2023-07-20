import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { ReportViewUpdate } from "../../reports-models";
import { ActiveReportService } from "../../services/active-report.service";
import { PagingArgs } from "@/api/models";
import { ReportsService } from "@/reports/reports.service";
import { ActivatedRoute } from "@angular/router";
import { UnsubscriberService } from "@/services/unsubscriber.service";
import { ObjectService } from "@/services/object.service";
import { deepEquals } from "@/tools/object-tools.lib";
import { RouterService } from "@/services/router.service";

@Component({ template: '', providers: [UnsubscriberService] })
export abstract class ReportComponentBase<TFlatParameters extends {}, TStructuredParameters extends {}> implements OnInit {
    // manually injected services (so the inheritors don't have to resolve dependencies)
    protected readonly activeReportService = inject(ActiveReportService);
    protected readonly reportsService = inject(ReportsService);
    protected readonly route = inject(ActivatedRoute);
    protected readonly routerService = inject(RouterService);
    protected readonly unsub = inject(UnsubscriberService);
    protected readonly objectService = inject(ObjectService);

    private _lastParameters?: TFlatParameters;

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

    protected handlePagingChange(paging: PagingArgs) {
        this.routerService.updateQueryParams({ parameters: { ...paging } });
    }

    private async _updateView(parameters: TFlatParameters) {
        this._lastParameters = parameters;
        const viewUpdate = await this.updateView(parameters);
        this.activeReportService.metaData$.next(viewUpdate.metaData);
        this.activeReportService.htmlElement$.next(viewUpdate.reportContainerRef);
        // if (!deepEquals(parameters, this._lastParameters)) {

        // }
    }
}
