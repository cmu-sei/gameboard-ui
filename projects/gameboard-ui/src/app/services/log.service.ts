/* eslint-disable no-console */

import { Injectable } from '@angular/core';
import { environment } from '@/../environments/environment';
import { LogLevel } from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class LogService {
  // temporary for debugging - should be at error only
  private readonly _logLevel: LogLevel = LogLevel.Information;

  constructor() {
    if (!environment.production) {
      this._logLevel = LogLevel.Information;
    }
  }

  // This is mostly here to allow logging from SignalR, but we structure other
  // log channels with objects for readability in the console
  log(level: LogLevel, message: string): void {
    this.logInfo(`[SignalR]: ${message}`);
  }

  debug(...params: any[]) {
    if (this._logLevel <= LogLevel.Debug)
      console.debug(...params);
  }

  logInfo(...params: any[]) {
    if (this._logLevel == LogLevel.Information)
      console.info(...params);
  }

  logWarning(...params: any[]) {
    if (this._logLevel <= LogLevel.Warning)
      console.warn(...params);
  }

  logError(...params: any[]) {
    if (this._logLevel <= LogLevel.Error) {
      console.error(...params);
    }
  }
}
