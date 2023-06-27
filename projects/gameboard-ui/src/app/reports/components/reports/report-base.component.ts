import { Component, OnDestroy } from "@angular/core";
import { ReportViewUpdate } from "../../reports-models";
import { ActiveReportService } from "../../services/active-report.service";
import { Subscription } from "rxjs";

@Component({ template: '' })
export abstract class ReportComponentBase<TStructured extends {}, TReportRecord> implements OnDestroy {
    private _parameterResetSub?: Subscription;

    private _selectedParameters?: TStructured;
    public get selectedParameters(): TStructured {
        return this._selectedParameters || this.getDefaultParameters();
    }
    public set selectedParameters(value: TStructured) {
        if (value === undefined) {
            value = this.getDefaultParameters();
        }
        else {
            // if something sets the value of the a default parameter to undefined and if 
            // the specified default parameters have a value for this, use that instead
            for (const entry of Object.entries(value)) {
                if (entry[1] === undefined) {
                    (value as any)[entry[0]] = (this.getDefaultParameters() as any)[entry[0]];
                }
            }
        }

        this._selectedParameters = value;
        this._updateView(value);
    }

    constructor(protected activeReportService: ActiveReportService) {
        activeReportService.parameterResetRequest$.subscribe(_ => {
            this.selectedParameters = this.getDefaultParameters();
        });
    }

    ngOnDestroy(): void {
        this._parameterResetSub?.unsubscribe();
    }

    abstract getDefaultParameters(): TStructured;
    abstract updateView(parameters: TStructured): Promise<ReportViewUpdate<TReportRecord>>;

    private async _updateView(parameters: TStructured) {
        const viewUpdate = await this.updateView(parameters);
        this.activeReportService.parametersPristine = true;
        this.activeReportService.metaData$.next(viewUpdate.results.metaData);
        this.activeReportService.htmlElement$.next(viewUpdate.reportContainerRef);
    }
}
