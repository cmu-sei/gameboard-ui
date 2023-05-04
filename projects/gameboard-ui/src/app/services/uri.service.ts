import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UriService {
  toObject(query: string): any {
    const stripStart = (query.startsWith('?') ? query.substring(1) : query);
    const retVal: any = {};

    for (let pair of stripStart.split("&")) {
      const keyValue = pair.split("=");
      retVal[keyValue[0]] = keyValue[1];
    }

    return retVal;
  }

  toQueryString<TObject extends { [key: string]: any }>(target: TObject | null | undefined, prependWithQuestionMark = true): string {
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

      finalParams.push(`${key}=${value}`);
    }

    console.log("final params", finalParams);

    if (finalParams.length) {
      const queryString = finalParams.join("&");
      if (prependWithQuestionMark) {
        return `?${queryString}`;
      }
      else {
        return queryString;
      }
    }

    return '';
  }
}
