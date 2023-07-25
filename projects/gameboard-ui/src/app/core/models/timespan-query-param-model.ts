import { ReportTimeSpan, minutesToTimeSpan, timespanToMinutes } from "@/reports/reports-models";
import { RouterService } from "@/services/router.service";
import { UnsubscriberService } from "@/services/unsubscriber.service";
import { inject } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";

export class TimespanQueryParamModel {
    paramName: string;

    private route: ActivatedRoute = inject(ActivatedRoute);
    private routerService: RouterService = inject(RouterService);
    private unsub: UnsubscriberService = inject(UnsubscriberService);

    constructor(config: { paramName: string }) {
        this.paramName = config.paramName;
        this.unsub.add(
            this.route.queryParamMap.subscribe(paramMap => {
                this._model = paramMap.has(this.paramName) ? minutesToTimeSpan(parseInt(paramMap.get(this.paramName)!)) : {};
            })
        );
    }

    private _model: ReportTimeSpan = {};

    get days(): number | null {
        return this._model.days || null;
    }
    set days(value: number | null) {
        if (value !== this._model.days) {
            this._model.days = value || undefined;
            this.updateQueryParams(this._model);
        }
    }

    get hours(): number | null {
        return this._model.hours || null;
    }
    set hours(value: number | null) {
        if (value !== this._model.hours) {
            this._model.hours = value || undefined;
            this.updateQueryParams(this._model);
        }
    }

    get minutes(): number | null {
        return this._model.minutes || null;
    }
    set minutes(value: number | null) {
        if (value !== this._model.minutes) {
            this._model.minutes = value || undefined;
            this.updateQueryParams(this._model);
        }
    }

    private updateQueryParams(model: ReportTimeSpan | null) {
        const params: Params = {};
        const minutes = model ? timespanToMinutes(model) : null;
        params[this.paramName] = minutes || null;

        this.routerService.updateQueryParams({
            parameters: params
        });
    }
}
