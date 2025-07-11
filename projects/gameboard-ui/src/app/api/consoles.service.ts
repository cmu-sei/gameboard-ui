import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { ConsoleId, ConsoleUserActivityResponse, ConsoleUserActivityType, GetConsoleResponse, ListConsolesRequest, ListConsolesResponse } from './consoles.models';
import { ApiDateTimeService } from '@/services/api-date-time.service';

@Injectable({ providedIn: 'root' })
export class ConsolesService {
  private readonly apiDates = inject(ApiDateTimeService);
  private readonly apiUrl = inject(ApiUrlService);
  private readonly http = inject(HttpClient);

  getConsole(challengeId: string, name: string): Promise<GetConsoleResponse> {
    return firstValueFrom(this.http.get<GetConsoleResponse>(this.apiUrl.build("consoles", { challengeId, name })).pipe(map(r => {
      if (r.expiresAt) {
        r.expiresAt = this.apiDates.toDateTime(r.expiresAt.toString());
      }

      return r;
    })));
  }

  listConsoles(request: ListConsolesRequest): Promise<ListConsolesResponse> {
    return firstValueFrom(this.http.get<ListConsolesResponse>(this.apiUrl.build("consoles/list", request)));
  }

  logUserActivity(consoleId: ConsoleId, eventType: ConsoleUserActivityType): Promise<ConsoleUserActivityResponse> {
    return firstValueFrom(this.http.post<ConsoleUserActivityResponse>(this.apiUrl.build("consoles/active"), consoleId));
  }

  setConsoleActiveUser(consoleId: ConsoleId) {
    return firstValueFrom(this.http.post<void>(this.apiUrl.build("consoles/user"), consoleId));
  }
}
