import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UriService {
  uriEncode(target: any): string {
    if (!target) {
      return "";
    }

    return new URLSearchParams(target).toString();
  }

  toQueryString<TObject extends { [key: string]: any }>(target: TObject): string {
    const finalParams: string[] = [];
    for (const key of Object.keys(target)) {
      const value = target[key];

      console.log("value", value);
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

      console.log("added");
      finalParams.push(`${key}=${value}`);
    }

    console.log("final params", finalParams);
    return finalParams.join("&");
  }
}
