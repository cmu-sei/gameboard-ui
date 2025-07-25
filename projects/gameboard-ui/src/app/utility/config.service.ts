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
import { Environment, EnvironmentSettings } from '../../environments/environment-typed';
import { LogLevel } from '@cmusei/console-forge';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private url = environment.settingsJson;
  private restorationComplete = false;

  basehref = '';
  environment: Environment = environment;
  local: LocalAppSettings = {};
  absoluteUrl = '';
  settings$ = new BehaviorSubject<EnvironmentSettings>(this.environment.settings);

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
    let path = this.environment.settings.apphost || this.basehref;
    if (!path.endsWith('/')) {
      path += '/';
    }
    return path;
  }

  get appName(): string {
    return this.environment.settings.appname || "Gameboard";
  }

  get imagehost(): string {
    return this.environment.settings.imghost || `${this.basehref}img`;
  }

  get tochost(): string {
    return this.environment.settings.tochost || `${this.basehref}docs`;
  }

  get supporthost(): string {
    return this.environment.settings.supporthost || `${this.basehref}supportfiles`;
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

  load(): Observable<EnvironmentSettings> {
    // console forge defaults if unspecified
    const defaultConsoleForgeConfig = {
      consoleBackgroundStyle: "rgb(0, 0, 0)",
      defaultConsoleClientType: "vmware",
      logThreshold: LogLevel.DEBUG,
      showBrowserNotificationsOnConsoleEvents: true
    };

    if (!environment.settingsJson) {
      return of({
        consoleForgeConfig: defaultConsoleForgeConfig
      } as EnvironmentSettings);
    }

    return this.http.get<EnvironmentSettings>(this.basehref + this.url)
      .pipe(
        catchError((err: Error) => {
          return of({ consoleForgeConfig: defaultConsoleForgeConfig } as EnvironmentSettings);
        }),
        tap(s => {
          if (!s || Object.keys(s).length == 0) {
            this.log.logError(`Unable to load settings file from url ${this.basehref + this.url}`);
          }
          if (s) {
            this.environment.settings = { ...this.environment.settings, ...s };
            this.environment.settings.oidc = { ...this.environment.settings.oidc, ...s.oidc };
            this.settings$.next(this.environment.settings);
          }
        })
      );
  }

  updateLocal(model: LocalAppSettings): void {
    this.local = { ...this.local, ...model };
    this.storeLocal(this.local);
    this.restorationComplete = true;
  }

  storeLocal(model: LocalAppSettings): void {
    try {
      this.storage.add(StorageKey.Gameboard, model);
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

export interface AppUserManagerSettings extends UserManagerSettings {
  authority: string;
  autoLogin?: boolean;
  autoLogout?: boolean;
  client_id: string;
  debug?: boolean;
  redirect_uri: string;
  useLocalStorage?: boolean;
}
