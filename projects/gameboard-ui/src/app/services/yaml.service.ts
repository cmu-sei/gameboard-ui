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
    const requestUrl = `${this.config.absoluteUrl}assets/yaml/${name}.sample.yaml`;
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

  render<T extends {}>(input: T, headerComment?: string): string {
    const doc = new YAML.Document(input, (key, value) => {
      // if undefined, the key is left out of the rendered
      // object, which is what we want for most cases
      if (value === null || value === undefined)
        return undefined;

      return value;
    });

    if (headerComment) {
      doc.commentBefore = headerComment;
    }

    return doc.toString();

    return YAML.stringify(input, (key, value) => {

      if (value === null || value === undefined)
        return undefined;

      return value;
    });
  }
}
