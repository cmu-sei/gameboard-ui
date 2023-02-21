import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.http.post<ApiKeyViewModelWithPlainKey>(`${this.url}/api-keys`, model);
  }

  public deleteApiKey(apiKeyId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/api-keys/${apiKeyId}`);
  }

  public listUserApiKeys(userId: string): Observable<ApiKeyViewModel[]> {
    return this.http.get<ApiKeyViewModel[]>(`${this.url}/users/${userId}/api-keys`);
  }
}
