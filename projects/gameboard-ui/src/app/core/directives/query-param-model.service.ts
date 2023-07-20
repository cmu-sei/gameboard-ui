import { ReportTimeSpan } from '@/reports/reports-models';
import { EventEmitter, Injectable } from '@angular/core';
import { QueryParamModelConfig, QueryStringSerializer } from './query-param-model.directive';
import { ReportsService } from '@/reports/reports.service';

@Injectable({ providedIn: 'root' })
export class QueryParamModelService {
  constructor(private reportsService: ReportsService) { }

  getTimeSpanQueryModelConfig(name: string, emitter: EventEmitter<ReportTimeSpan | null>, debounce?: number): QueryParamModelConfig<ReportTimeSpan> {
    return {
      name,
      emitter,
      debounce: debounce || 500,
      serialize: (value) => this.serializeTimeSpan(value)
    };
  }

  serializeTimeSpan(value: ReportTimeSpan | null): string | null {
    const serialized = this.reportsService.timespanToMinutes(value);
    return serialized > 0 ? serialized.toString() : null;
  }

  deserializeTimeSpan(value: string | null): ReportTimeSpan | null {
    if (!value) {
      return null;
    }

    return this.reportsService.minutesToTimeSpan(parseInt(value));
  }
}
