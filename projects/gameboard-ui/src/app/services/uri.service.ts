import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UriService {
  uriEncode(target: any): string {
    if (!target) {
      return "";
    }

    return new URLSearchParams(target).toString();
  }

  toObject(query: string): any {
    const stripStart = (query.startsWith('?') ? query.substring(1) : query);
    const retVal: any = {};

    for (let pair of stripStart.split("&")) {
      const keyValue = pair.split("=");
      retVal[keyValue[0]] = keyValue[1];
    }

    return retVal;
  }

  toQueryString<TObject extends { [key: string]: any }>(target: TObject): string {
    const finalParams: string[] = [];
    for (const key of Object.keys(target)) {
      const value = target[key];

      if (
        value === null ||
        value === undefined ||
        value === '' ||
        Object.keys(value)?.length === 0 ||
        // TODO: see if i can bind better so i don't have to screen this here
        value === 'undefined'
      ) {
        continue;
      }

      finalParams.push(`${key}=${value}`);
    }

    return finalParams.join("&");
  }
}
