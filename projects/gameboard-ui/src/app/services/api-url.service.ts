import { Injectable } from '@angular/core';
import { ConfigService } from '../utility/config.service';

@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  private readonly API_ROOT = `${this.config.apphost}api`;

  constructor(private config: ConfigService) { }

  build(relativeUrl: string) {
    const finalRelativeUrl = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
    return `${this.API_ROOT}${finalRelativeUrl}`;
  }
}
