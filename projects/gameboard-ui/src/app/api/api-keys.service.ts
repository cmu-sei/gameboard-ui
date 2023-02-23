import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, min } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { ApiKeyViewModel, ApiKeyViewModelWithPlainKey, NewApiKey } from './api-keys.models';

@Injectable({ providedIn: 'root' })
export class ApiKeysService {
  private url: string;

  constructor(
    private config: ConfigService,
    private http: HttpClient
  ) {
    this.url = config.apphost + 'api';
  }

  public createApiKey(model: NewApiKey): Observable<ApiKeyViewModelWithPlainKey> {
    // normalize emptystring, etc.
    model.expiresOn = model.expiresOn || undefined;

    return this.http.post<ApiKeyViewModelWithPlainKey>(`${this.url}/api-keys`, model);
  }

  public deleteApiKey(apiKeyId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/api-keys/${apiKeyId}`);
  }

  public listUserApiKeys(userId: string): Observable<ApiKeyViewModel[]> {
    return this.http.get<ApiKeyViewModel[]>(`${this.url}/users/${userId}/api-keys`).pipe(
      map(keys => keys.map(k => {
        // todo: pipe
        const isUndefinedDate = k.expiresOn && k.expiresOn.toString() == "0001-01-01T00:00:00+00:00";

        k.expiresOn = isUndefinedDate ? undefined : k.expiresOn;
        console.log("k", k);
        return k;
      }))
    );
  }
}
