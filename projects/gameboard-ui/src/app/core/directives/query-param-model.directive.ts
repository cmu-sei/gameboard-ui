import { RouterService } from '@/services/router.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Params } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';

export interface QueryParamModelConfig<T> {
  name: string;
  debounce?: number;
  serialize?: (value: T) => string;
  deserialize?: (queryStringValue: string) => T;
  resetQueryParams?: string[]
}

@Directive({ selector: '[appQueryParamModel]' })
export class QueryParamModelDirective<T> implements OnInit {
  @Input('appQueryParamModel') config?: QueryParamModelConfig<T>;

  private _queryParamsBuffer$ = new Subject<T>();
  private _publishUpdate$ = new Subject<T>();
  public valueChanged$ = this._publishUpdate$.asObservable();

  constructor(
    private elementRef: ElementRef,
    private routerService: RouterService,
    private unsub: UnsubscriberService) { }

  ngOnInit(): void {
    if (!this.config) {
      throw new Error(`Use of the QueryParamModel directive requires configuration of type QueryParamModelConfig<T>. You passed: ${this.config}`);
    }

    this.unsub.add(
      this._queryParamsBuffer$.pipe(
        debounceTime(this.config.debounce || 0)
      ).subscribe(paramValue => {
        this.navigate(paramValue);
      })
    );

    const el = this.elementRef.nativeElement as HTMLInputElement;
    const existingEvent = el.oninput;
    el.oninput = async (ev: Event) => {
      if (existingEvent)
        existingEvent.bind(el.ownerDocument)(ev);

      this._queryParamsBuffer$.next((ev.target as any).value);
    };
  }

  private async navigate(value: T): Promise<void> {
    const serialized = this.config?.serialize ? this.config.serialize(value) : this.defaultSerialize(value);
    const params: Params = {};
    params[this.config!.name] = serialized;

    await this.routerService.updateQueryParams({ ...params }, this.config?.resetQueryParams);
  }

  private defaultSerialize(value: T) {
    return value?.toString() || "";
  }
}
