import { ReportTimeSpan } from '@/reports/reports-models';
import { EventEmitter, Injectable } from '@angular/core';
import { QueryParamModelConfig, QueryStringParameter } from './query-param-model.directive';
import { ReportsService } from '@/reports/reports.service';
import { ReportGameChallengeSpec } from '@/reports/components/parameters/parameter-game-challengespec/parameter-game-challengespec.component';

@Injectable({ providedIn: 'root' })
export class QueryParamModelService {
  constructor(private reportsService: ReportsService) { }

  getGameChallengeSpecQueryModelConfig(config: { gameIdParamName: string, challengeSpecIdParamName: string, emitter: EventEmitter<ReportGameChallengeSpec | null> }): QueryParamModelConfig<ReportGameChallengeSpec> {
    return {
      propertyNameToQueryParamNameMap: [
        { propertyName: "gameId", queryStringParamName: config.gameIdParamName, },
        { propertyName: "challengeSpecId", queryStringParamName: config.challengeSpecIdParamName }
      ],
      emitter: config.emitter,
      serializeMulti: (value, propertyNameMap): QueryStringParameter[] | null => {
        if (value?.challengeSpecId) {
          return [{
            name: propertyNameMap["challengeSpecId"],
            value: value.challengeSpecId
          }];
        }

        if (value?.gameId) {
          return [{
            name: propertyNameMap["gameId"],
            value: value.gameId
          }];
        }

        return null;
      },
      deserializeMulti: (queryParams, propertyNameMap): ReportGameChallengeSpec | null => {
        if (!queryParams) {
          return null;
        }

        return {
          challengeSpecId: queryParams[propertyNameMap["challengeSpecId"]] || undefined,
          gameId: queryParams[propertyNameMap["gameId"]] || undefined,
        };
      }
    };
  }

  getTimeSpanQueryModelConfig(name: string, emitter: EventEmitter<ReportTimeSpan | null>, debounce?: number): QueryParamModelConfig<ReportTimeSpan> {
    return {
      name,
      emitter,
      debounce: debounce || 500,
      serialize: (value) => this.serializeTimeSpan(value),
      deserialize: (value) => this.deserializeTimeSpan(value)
    };
  }

  private serializeTimeSpan(value: ReportTimeSpan | null): string | null {
    const serialized = this.reportsService.timespanToMinutes(value);
    return serialized > 0 ? serialized.toString() : null;
  }

  private deserializeTimeSpan(value: string | null): ReportTimeSpan | null {
    if (!value) {
      return null;
    }

    return this.reportsService.minutesToTimeSpan(parseInt(value));
  }
}
