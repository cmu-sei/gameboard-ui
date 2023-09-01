// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserManagerSettings } from 'oidc-client-ts';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Location, PlatformLocation } from '@angular/common';
import { LocalStorageService, StorageKey } from '../services/local-storage.service';
import { LogService } from '../services/log.service';
import { VmState } from '@/api/board-models';
import { BrowserService } from '@/services/browser.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {

  private url = environment.settingsJson;
  private restorationComplete = false;
  basehref = '';
  settings: Settings = environment.settings;
  local: LocalAppSettings = {};
  absoluteUrl = '';
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
    private browser: BrowserService,
    private http: HttpClient,
    private location: Location,
    private log: LogService,
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
      path += '/';
    }
    return path;
  }

  get unityHost(): string {
    let path = this.settings.unityclienthost || this.basehref;
    if (!path.endsWith('/')) {
      path += '/';
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

  load(): Observable<Settings> {
    if (!environment.settingsJson) {
      return of({} as Settings);
    }

    return this.http.get<Settings>(this.basehref + this.url)
      .pipe(
        catchError((err: Error) => {
          return of({} as Settings);
        }),
        tap(s => {
          if (!s || Object.keys(s).length == 0) {
            this.log.logWarning(`Unable to load settings file from url ${this.basehref + this.url}`);
          }
          if (s) {
            this.settings = { ...this.settings, ...s };
            this.settings.oidc = { ...this.settings.oidc, ...s.oidc };
            this.settings$.next(this.settings);
          }
        })
      );
  }

  buildConsoleUrl(vm: VmState) {
    return `${this.mkshost}?`;
  }

  openConsole(qs: string): void {
    this.browser.showTab(this.mkshost + qs);
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
      this.log.logError("Couldn't save app settings to local storage", model);
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
