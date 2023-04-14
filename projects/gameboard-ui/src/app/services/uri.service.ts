import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UriService {
  uriEncode(target: any): string {
    if (!target) {
      return "";
    }

    return new URLSearchParams(target).toString();
  }
}
