import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { GameboardSettings } from './settings.models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private apiUrl: ApiUrlService, private http: HttpClient) { }

  get(): Promise<GameboardSettings> {
    return firstValueFrom(this.http.get<GameboardSettings>(this.apiUrl.build("settings")));
  }
}
