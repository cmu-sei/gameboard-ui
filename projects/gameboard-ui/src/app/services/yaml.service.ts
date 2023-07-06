import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as YAML from 'yaml';
import { ConfigService } from '../utility/config.service';
import { LogService } from './log.service';

@Injectable({ providedIn: 'root' })
export class YamlService {
  constructor(
    private config: ConfigService,
    private http: HttpClient,
    private log: LogService) { }

  async loadSample(name: string): Promise<string | null> {
    const requestUrl = `${this.config.absoluteUrl}assets/yaml/${name}/sample.gameboard.yaml`;
    const response = await firstValueFrom(this.http.get(requestUrl, { responseType: 'text' }));

    if (!response) {
      this.log.logError(`Couldn't load sample from "${requestUrl}"`);
      return null;
    }

    return response;
  }

  parse<T>(input: string): T {
    return YAML.parse(input) as T;
  }
}
