import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { GameboardSettings, GetGameboardSettingsResponse } from './settings.models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private apiUrl: ApiUrlService, private http: HttpClient) { }

  async get(): Promise<GameboardSettings> {
    const result = await firstValueFrom(this.http.get<GetGameboardSettingsResponse>(this.apiUrl.build("settings")));
    return result.settings;
  }
}
