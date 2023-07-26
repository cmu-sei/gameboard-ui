import { RouterService } from "@/services/router.service";
import { UnsubscriberService } from "@/services/unsubscriber.service";
import { arraysEqual } from "@/tools/object-tools.lib";
import { inject } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { BehaviorSubject } from "rxjs";

export interface MultiSelectQueryParamModelConfig<T> {
    paramName: string;
    options?: Promise<T[]>;
    serializer?: (value: T) => string;
    deserializer?: (serializedValue: string, options?: T[]) => T | null;
}

export class MultiSelectQueryParamModel<TOption> {
    config: MultiSelectQueryParamModelConfig<TOption>;
    options: TOption[] = [];

    private route: ActivatedRoute = inject(ActivatedRoute);
    private routerService: RouterService = inject(RouterService);
    private unsub: UnsubscriberService = inject(UnsubscriberService);

    private static QUERYSTRING_VALUE_DELIMITER = ",";
    private _model$ = new BehaviorSubject<TOption[]>([]);
    modelUpdate$ = this._model$.asObservable();

    constructor(config: MultiSelectQueryParamModelConfig<TOption>) {
        this.config = { ...config };
        this.config.serializer = this.config.serializer || (value => (value as any).toString());
        this.config.deserializer = this.config.deserializer || (serializedValue => (serializedValue as TOption));

        if (this.config.options) {
            this.config.options.then(options => {
                this.options = options;
                this.bindQueryParamsHandler();
            });
        } else {
            this.bindQueryParamsHandler();
        }
    }

    public get selectedValues(): TOption[] {
        return this._model$.getValue();
    }
    set selectedValues(values: TOption[]) {
        const previousValue = this._model$.getValue().map(v => this.config.serializer!(v));
        const currentValue = values.map(v => this.config.serializer!(v));

        if (!arraysEqual(previousValue, currentValue)) {
            this._model$.next(values);
            this.updateQueryParams(values);
        }
    }

    private bindQueryParamsHandler() {
        this.unsub.add(
            this.route.queryParamMap.subscribe(paramMap => {
                this.selectedValues = paramMap.has(this.config.paramName) ?
                    paramMap.get(this.config.paramName)!
                        .split(MultiSelectQueryParamModel.QUERYSTRING_VALUE_DELIMITER)
                        .map(value => this.config.deserializer!(value, this.options))
                        .filter(o => !!o) as TOption[] :
                    [];
            })
        );
    }

    private updateQueryParams(model: TOption[]) {
        const params: Params = {};
        params[this.config.paramName] = this
            .selectedValues
            .map(v => this.config.serializer!(v))
            .join(MultiSelectQueryParamModel.QUERYSTRING_VALUE_DELIMITER);

        this.routerService.updateQueryParams({
            parameters: params
        });
    }
}
