// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserManagerSettings } from 'oidc-client-ts';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Location, PlatformLocation } from '@angular/common';
import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { LocalStorageService, StorageKey } from './services/local-storage.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {

  private url = 'assets/settings.json';
  private restorationComplete = false;
  basehref = '';
  settings: Settings = environment.settings;
  local: LocalAppSettings = {};
  absoluteUrl = '';
  tabs: TabRef[] = [];
  settings$ = new BehaviorSubject<Settings>(this.settings);
  sidebar$ = new Subject<boolean>();

  get lastUrl(): string {
    const url = !this.restorationComplete
      ? this.local.last || ''
      : '';
    this.restorationComplete = true;
    return url;
  }

  get currentPath(): string {
    return this.location.path();
  }

  embeddedMonacoOptions = {
    language: 'markdown',
    lineNumbers: 'off',
    minimap: { enabled: false },
    quickSuggestions: false,
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    linkedEditing: true,
    fixedOverflowWidgets: true
  };

  datedisplay_options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };

  _shortdate_formatter = new Intl.DateTimeFormat(
    'en-US',
    this.datedisplay_options
  );

  _shorttz_formatter = new Intl.DateTimeFormat(
    'en-US',
    { ...this.datedisplay_options, timeZoneName: 'short' }
  );

  datedisplay_options_with_seconds: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };

  _shortdate_formatter_with_seconds = new Intl.DateTimeFormat(
    'en-US',
    this.datedisplay_options_with_seconds
  );

  _shorttz_formatter_with_seconds = new Intl.DateTimeFormat(
    'en-US',
    { ...this.datedisplay_options_with_seconds, timeZoneName: 'short' }
  );

  constructor(
    private http: HttpClient,
    private location: Location,
    private storage: LocalStorageService,
    platform: PlatformLocation
  ) {
    this.basehref = platform.getBaseHrefFromDOM();
    this.absoluteUrl = `${window.location.protocol}//${window.location.host}${this.basehref}`;
    this.local = this.getLocal();
    if (!this.local.lastSeenSupport) {
      this.local.lastSeenSupport = Date.now();
    }
  }

  get apphost(): string {
    let path = this.settings.apphost || this.basehref;
    if (!path.endsWith('/')) {
      path += '/';
    }
    return path;
  }

  get gamebrainhost(): string {
    let path = this.settings.gamebrainhost || this.basehref;
    if (!path.endsWith('/')) {
      path += '/'
    }
    return path;
  }

  get unityHost(): string {
    let path = this.settings.unityclienthost || this.basehref;
    if (!path.endsWith('/')) {
      path += '/'
    }
    return path;
  }

  get mkshost(): string {
    let path = this.settings.mkshost || `${this.basehref}mks`;
    if (!path.endsWith('/')) {
      path += '/';
    }
    return path;
  }

  get imagehost(): string {
    return this.settings.imghost || `${this.basehref}img`;
  }

  get tochost(): string {
    return this.settings.tochost || `${this.basehref}docs`;
  }

  get supporthost(): string {
    return this.settings.supporthost || `${this.basehref}supportfiles`;
  }

  get shortdate_formatter(): any {
    return this._shortdate_formatter;
  }

  get shorttz_formatter(): any {
    return this._shorttz_formatter;
  }

  get shorttz_formatter_with_seconds(): any {
    return this._shorttz_formatter_with_seconds;
  }

  get lastSeenSupport(): Date {
    return new Date(this.local.lastSeenSupport!);
  }

  load(): Observable<any> {
    return this.http.get<Settings>(this.basehref + this.url)
      .pipe(
        catchError((err: Error) => {
          return of({} as Settings);
        }),
        tap(s => {
          this.settings = { ...this.settings, ...s };
          this.settings.oidc = { ...this.settings.oidc, ...s.oidc };
          this.settings$.next(this.settings);
        })
      );
  }

  openConsole(qs: string): void {
    this.showTab(this.mkshost + qs);
  }

  showTab(url: string): void {
    let item = this.tabs.find(t => t.url === url);

    if (!item) {
      item = { url, window: null };
      this.tabs.push(item);
    }

    if (!item.window || item.window.closed) {
      item.window = window.open(url);
    } else {
      item.window.focus();
    }
  }

  updateLocal(model: LocalAppSettings): void {
    this.local = { ...this.local, ...model };
    this.storeLocal(this.local);
    this.restorationComplete = true;
  }

  storeLocal(model: LocalAppSettings): void {
    try {
      this.storage.add(StorageKey.Gameboard, JSON.stringify(model));
    } catch (e) {
    }
  }
  getLocal(): LocalAppSettings {
    try {
      return JSON.parse(this.storage.get(StorageKey.Gameboard)!) || {};
    } catch (e) {
      return {};
    }
  }
  clearStorage(): void {
    this.storage.clear(StorageKey.Gameboard);
  }
}

export interface LocalAppSettings {
  theme?: string;
  last?: string;
  lastSeenSupport?: number;
  ticketFilter?: string;
  ticketType?: string;
  ticketTerm?: string;
  ticketOrder?: string;
  ticketOrderDesc?: boolean;
}

export interface Settings {
  appname?: string;
  apphost?: string;
  mkshost?: string;
  imghost?: string;
  tochost?: string;
  supporthost?: string;
  gamebrainhost?: string;
  unityclienthost?: string;
  tocfile?: string;
  custom_background?: string;
  countdownStartSecondsAtMinute?: number;
  oidc: AppUserManagerSettings;
}

export interface AppUserManagerSettings extends UserManagerSettings {
  authority: string;
  client_id: string;
  redirect_uri: string;
  useLocalStorage?: boolean;
  debug?: boolean;
}

export interface TabRef {
  url: string;
  window: Window | null;
}

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.image = (href, title, text) => {
    return `<div class="text-center"><img class="img-fluid rounded" src=${href} alt="${text}" /></div>`;
  };
  renderer.blockquote = (quote) => {
    return `<blockquote class="blockquote">${quote}</blockquote>`;
  };
  renderer.table = (header, body) => {
    return `<table class="table table-striped"><thead>${header}</thead><tbody>${body}</tbody></table>`;
  };
  return {
    renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false
  };
}
