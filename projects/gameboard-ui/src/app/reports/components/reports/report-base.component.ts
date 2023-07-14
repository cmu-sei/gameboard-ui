import { Component, OnDestroy } from "@angular/core";
import { ReportViewUpdate } from "../../reports-models";
import { ActiveReportService } from "../../services/active-report.service";
import { Subscription } from "rxjs";

@Component({ template: '' })
export abstract class ReportComponentBase<TStructuredParameters extends {}, TReportRecord> implements OnDestroy {
    private _defaultParameters: TStructuredParameters;
    private _parameterResetSub?: Subscription;
    private _runRequestSub?: Subscription;

    private _selectedParameters?: TStructuredParameters;
    public get selectedParameters(): TStructuredParameters {
        return this._selectedParameters!;
    }
    public set selectedParameters(value: TStructuredParameters) {
        if (value === undefined) {
            value = this._defaultParameters;
        }
        else {
            // if something sets the value of the a default parameter to undefined and if 
            // the specified default parameters have a value for this, use that instead
            for (const entry of Object.entries(value)) {
                if (entry[1] === undefined) {
                    (value as any)[entry[0]] = (this._defaultParameters as any)[entry[0]];
                }
            }
        }

        this._selectedParameters = value;
        this._updateView(value);
    }

    constructor(protected activeReportService: ActiveReportService) {
        this._defaultParameters = this.getDefaultParameters();
        this._selectedParameters = this._defaultParameters;

        this._parameterResetSub = activeReportService.parameterResetRequest$.subscribe(_ => {
            this.selectedParameters = this._defaultParameters;
        });

        this._runRequestSub = activeReportService.runRequest$.subscribe(_ => this.updateView(this.selectedParameters));
    }

    ngOnDestroy(): void {
        this._parameterResetSub?.unsubscribe();
        this._runRequestSub?.unsubscribe();
    }

    protected abstract getDefaultParameters(): TStructuredParameters;
    protected abstract updateView(parameters: TStructuredParameters): Promise<ReportViewUpdate>;

    private async _updateView(parameters: TStructuredParameters) {
        const viewUpdate = await this.updateView(parameters);
        this.activeReportService.parametersPristine = true;
        this.activeReportService.metaData$.next(viewUpdate.metaData);
        this.activeReportService.htmlElement$.next(viewUpdate.reportContainerRef);
    }
}
