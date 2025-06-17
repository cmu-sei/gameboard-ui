import { Component, inject } from "@angular/core";
import { ReportViewUpdate } from "../../reports-models";
import { ActiveReportService } from "@/reports/services/active-report.service";
import { PagingArgs } from "@/api/models";
import { ReportsService } from "@/reports/reports.service";
import { ActivatedRoute } from "@angular/router";
import { UnsubscriberService } from "@/services/unsubscriber.service";
import { RouterService } from "@/services/router.service";

@Component({
    template: '', providers: [UnsubscriberService],
    standalone: false
})
export abstract class ReportComponentBase<TParameters extends {}> {
    protected readonly activeReportService = inject(ActiveReportService);
    protected readonly reportsService = inject(ReportsService);
    protected readonly route = inject(ActivatedRoute);
    protected readonly routerService = inject(RouterService);
    protected readonly unsub = inject(UnsubscriberService);

    protected isLoading = false;

    constructor() {
        this.unsub.add(this.activeReportService.generateRequested$.subscribe(() => {
            this._updateView(this.route.snapshot.queryParams as TParameters);
        }));
    }

    protected abstract updateView(parameters: TParameters): Promise<ReportViewUpdate>;

    protected handlePagingChange(paging: PagingArgs) {
        this.routerService.updateQueryParams({ parameters: { ...paging } });
        this.activeReportService.generateRequested$.next();
    }

    private async _updateView(parameters: TParameters) {
        this.isLoading = true;
        const viewUpdate = await this.updateView(parameters);

        if (viewUpdate) {
            this.activeReportService.metaData$.next(viewUpdate.metaData);
        }
        this.isLoading = false;
    }
}
