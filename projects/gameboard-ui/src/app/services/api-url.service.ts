import { Injectable } from '@angular/core';
import { ConfigService } from '../utility/config.service';

export interface BuildQueryModelOptions {
  arraysToDuplicateKeys?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  private readonly API_ROOT = `${this.config.apphost}api`;

  constructor(private config: ConfigService) { }

  build<TQuery>(relativeUrl: string, queryModel: TQuery | null = null, options: BuildQueryModelOptions = { arraysToDuplicateKeys: false }) {
    const finalRelativeUrl = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
    return `${this.API_ROOT}${finalRelativeUrl}${queryModel ? this.objectToQuery(queryModel, options) : ''}`;
  }

  objectToQuery<TObject extends { [key: string]: any }>(target: TObject | null | undefined, options: BuildQueryModelOptions = { arraysToDuplicateKeys: false }): string {
    if (!target) {
      return '';
    }

    const finalParams: string[] = [];
    for (const key of Object.keys(target)) {
      const value = target[key];

      if (
        value === null ||
        value === undefined ||
        value === '' ||
        Object.keys(key)?.length === 0 ||
        // TODO: see if i can bind better so i don't have to screen this here
        value === 'undefined'
      ) {
        continue;
      }

      if (Array.isArray(value) && options.arraysToDuplicateKeys) {
        for (const arrayValue of value) {
          finalParams.push(`${key}=${arrayValue}`);
        }
      } else {
        finalParams.push(`${key}=${value}`);
      }
    }

    if (finalParams.length) {
      const queryString = finalParams.join("&");
      return `?${queryString}`;
    }

    return '';
  }

  queryToObject<T>(query: string): T {
    const stripStart = (query.startsWith('?') ? query.substring(1) : query);
    const retVal: any = {};

    for (let pair of stripStart.split("&")) {
      const keyValue = pair.split("=");
      retVal[keyValue[0]] = keyValue[1];
    }

    return retVal as T;
  }
}
