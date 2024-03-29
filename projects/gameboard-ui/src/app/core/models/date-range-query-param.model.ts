import { ReportDateRange } from "@/reports/reports-models";
import { RouterService } from "@/services/router.service";
import { UnsubscriberService } from "@/services/unsubscriber.service";
import { inject } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";

export class DateRangeQueryParamModel {
    dateStartParamName = "dateStart";
    dateEndParamName = "dateEnd";

    private route: ActivatedRoute = inject(ActivatedRoute);
    private routerService: RouterService = inject(RouterService);
    private unsub: UnsubscriberService = inject(UnsubscriberService);

    constructor(config?: { dateStartParamName: string, dateEndParamName: string }) {
        this.dateStartParamName = config?.dateStartParamName || this.dateStartParamName;
        this.dateEndParamName = config?.dateEndParamName || this.dateEndParamName;

        this.unsub.add(
            this.route.queryParamMap.subscribe(paramMap => {
                this.dateStart = paramMap.has(this.dateStartParamName) ? new Date(paramMap.get(this.dateStartParamName)!) : null;
                this.dateEnd = paramMap.has(this.dateEndParamName) ? new Date(paramMap.get(this.dateEndParamName)!) : null;
            })
        );
    }

    private _dateStart: Date | null = null;
    get dateStart(): Date | null {
        return this._dateStart || null;
    }
    set dateStart(value: Date | null) {
        const previousValue = this._dateStart ? this._dateStart.valueOf() : null;
        const currentValue = value ? value.valueOf() : null;

        if (previousValue !== currentValue) {
            this._dateStart = value || null;
            this.updateQueryParams({
                dateStart: this.dateStart,
                dateEnd: this.dateEnd
            });
        }
    }

    private _dateEnd: Date | null = null;
    get dateEnd(): Date | null {
        return this._dateEnd || null;
    }
    set dateEnd(value: Date | null) {
        const previousValue = this._dateEnd ? this._dateEnd.valueOf() : null;
        const currentValue = value ? value.valueOf() : null;

        if (previousValue !== currentValue) {
            this._dateEnd = value || null;
            this.updateQueryParams({
                dateStart: this.dateStart,
                dateEnd: this.dateEnd
            });
        }
    }

    private updateQueryParams(model: ReportDateRange) {
        const params: Params = {};
        params[this.dateStartParamName] = model.dateStart?.toLocaleDateString("en-us");
        params[this.dateEndParamName] = model.dateEnd?.toLocaleDateString("en-us");

        this.routerService.updateQueryParams({ parameters: params });
    }
}
