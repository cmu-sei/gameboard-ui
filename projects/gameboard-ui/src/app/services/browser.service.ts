import { Injectable } from '@angular/core';

export interface TabRef {
  url: string;
  window: Window | null;
}

@Injectable({ providedIn: 'root' })
export class BrowserService {
  private _tabs: TabRef[] = [];

  showTab(url: string): void {
    let item = this._tabs.find(t => t.url === url);

    if (!item) {
      item = { url, window: null };
      this._tabs.push(item);
    }

    if (!item.window || item.window.closed) {
      item.window = window.open(url);
    } else {
      item.window.focus();
    }
  }
}
