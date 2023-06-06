import { Injectable } from '@angular/core';
import { ILogger, LogLevel } from '@microsoft/signalr';
import { environment } from 'projects/gameboard-ui/src/environments/environment';
import { LogService } from '../log.service';

@Injectable({ providedIn: 'root' })
export class SignalrLoggerService implements ILogger {

  constructor(private logService: LogService) { }

  log(logLevel: LogLevel, message: string): void {
    if (!environment.production || logLevel >= LogLevel.Error)
      this.logService.log(logLevel, message);
  }
}
