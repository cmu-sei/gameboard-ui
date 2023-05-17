import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

enum LogLevel {
  Info = 0,
  Warning = 1,
  Error = 2
}

@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly _logLevel: LogLevel = LogLevel.Error;

  constructor() {
    if (!environment.production) {
      this._logLevel = LogLevel.Info;
    }
  }

  logInfo(...params: any[]) {
    if (this._logLevel == LogLevel.Info)
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
