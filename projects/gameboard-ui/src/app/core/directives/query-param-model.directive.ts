import { ActivatedRoute, Params } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { ReportDateRange, ReportTimeSpan } from '@/reports/reports-models';
import { RouterService } from '@/services/router.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Directive, ElementRef, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface QueryStringParameter {
  name: string;
  value: string | null;
}

export type QueryStringSerializer<TValue> = (value: TValue | null) => string | null;
export type QueryStringDeserializer<TValue> = (value: string | null) => TValue | null;
export type QueryStringMultiSerializer<TValue> = (value: TValue | null, propertyNameMap: PropertyNameMap) => QueryStringParameter[] | null;
export type QueryStringMultiDeserializer<TValue> = (queryParams: Params | null, propertyNameMap: PropertyNameMap) => TValue | null;

// todo: there should be some kind of keyof typeof thing to do here
export type PropertyNameToQueryStringParamNameMap = { propertyName: string, queryStringParamName: string }[];
export type PropertyNameMap = { [propertyName: string]: string };

export interface QueryParamModelConfig<TValue> {
  name?: string;
  debounce?: number;
  emitter?: EventEmitter<TValue | null>;
  resetQueryParams?: string[];
  serialize?: QueryStringSerializer<TValue>;
  deserialize?: QueryStringDeserializer<TValue>;

  propertyNameToQueryParamNameMap?: PropertyNameToQueryStringParamNameMap;
  serializeMulti?: QueryStringMultiSerializer<TValue>;
  deserializeMulti?: QueryStringMultiDeserializer<TValue>;
}

@Directive({ selector: '[appQueryParamModel]', providers: [UnsubscriberService] })
export class QueryParamModelDirective<T> implements OnChanges {
  @Input('appQueryParamModel') config?: QueryParamModelConfig<T>;

  private _queryParamsBuffer$ = new Subject<T | null>();

  constructor(
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private routerService: RouterService,
    private unsub: UnsubscriberService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.config) {
      return;
    }
    if (!this.config) {
      this.unsub.unsubscribeAll();
      return;
    }

    this.unsub.add(
      this._queryParamsBuffer$.pipe(
        debounceTime(this.config.debounce || 0)
      ).subscribe(paramValue => {
        this.navigate(paramValue);
      })
    );

    if (!this.config.emitter) {
      const el = this.elementRef.nativeElement as HTMLInputElement;
      const existingEvent = el.oninput;
      el.oninput = async (ev: Event) => {
        if (existingEvent)
          existingEvent.bind(el.ownerDocument)(ev);

        this._queryParamsBuffer$.next((ev.target as any).value);
      };
    }

    else {
      this.unsub.add(
        this.config.emitter.subscribe(value => {
          this._queryParamsBuffer$.next(value);
        })
      );
    }
  }

  private async navigate(value: T | null): Promise<void> {
    const params: Params = {};

    if (!this.config) {
      throw new Error("Couldn't navigate via query param model - no configuration specified.");
    }

    if (value) {
      // use "name" as the discriminant for now
      if (this.config.name) {
        const serialized = this.config.serialize ? this.config.serialize(value) : defaultSerializer(value);
        params[this.config!.name] = serialized;
      } else if (this.config.propertyNameToQueryParamNameMap) {
        const propertyNameMap: PropertyNameMap = {};
        for (const nameMapping of this.config.propertyNameToQueryParamNameMap) {
          propertyNameMap[nameMapping.propertyName] = nameMapping.queryStringParamName;
        }

        const serialized = this.config!.serializeMulti!(value, propertyNameMap);

        if (serialized) {
          for (const param of serialized) {
            params[param.name] = param.value;
          }
        }
      }
    }

    await this.routerService.updateQueryParams({
      parameters: { ...params },
      resetParams: this.config?.resetQueryParams
    });
  }
}

export const defaultSerializer = <T>(value: T | null): string | null => value?.toString() || null;
export const defaultDeserializer = <T>(queryStringValue?: string): T | null => queryStringValue as T || null;

export const stringArraySerializer = (value: string[] | null): string | null => {
  if (!value?.length)
    return null;

  // handle the case where someone passes a single string instead of an array
  if (!Array.isArray(value))
    value = [value];

  return value.join(",");
};

export const stringArrayDeserializer = (value: string | null): string[] => {
  if (!value) {
    return [];
  }

  return value.split(",");
};

export const getStringArrayQueryModelConfig = (name: string, emitter: EventEmitter<string[] | null>): QueryParamModelConfig<string[]> => ({
  name,
  emitter,
  serialize: stringArraySerializer,
  deserialize: stringArrayDeserializer
});

export const getDateRangeQueryModelConfig = (config: { propertyNameMap: PropertyNameToQueryStringParamNameMap, emitter: EventEmitter<ReportDateRange | null> }): QueryParamModelConfig<ReportDateRange> => {
  return {
    emitter: config.emitter,
    serializeMulti: dateRangeSerializer,
    deserializeMulti: dateRangeDeserializer,
    propertyNameToQueryParamNameMap: config.propertyNameMap
  };
};

export const dateRangeSerializer: QueryStringMultiSerializer<ReportDateRange> = (value, propertyNameMap): QueryStringParameter[] | null => {
  if (!value || !(value.dateStart || value.dateEnd)) {
    return null;
  }

  const parameters: QueryStringParameter[] = [];

  if (value.dateStart) {
    parameters.push({
      name: propertyNameMap["dateStart"],
      value: value.dateStart.toLocaleDateString("en-us")
    });
  }

  if (value.dateEnd) {
    parameters.push({
      name: propertyNameMap["dateEnd"],
      value: value.dateEnd.toLocaleDateString("en-us")
    });
  }

  return parameters;
};

export const dateRangeDeserializer: QueryStringMultiDeserializer<ReportDateRange> = (params, propertyNameMap): ReportDateRange | null => {
  if (!params) {
    return null;
  }

  return {
    dateStart: params[propertyNameMap["dateStart"]],
    dateEnd: params[propertyNameMap["dateEnd"]]
  };
};
