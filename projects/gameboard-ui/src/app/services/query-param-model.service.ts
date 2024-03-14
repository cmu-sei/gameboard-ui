import { EventEmitter, Injectable } from '@angular/core';
import { QueryParamModelConfig, QueryStringParameter } from '../core/directives/query-param-model.directive';
import { ReportGameChallengeSpec } from '@/reports/components/parameters/parameter-game-challengespec/parameter-game-challengespec.component';

@Injectable({ providedIn: 'root' })
export class QueryParamModelService {
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
}
