import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { ConsoleId, ConsoleState, ConsoleUserActivityResponse, ConsoleUserActivityType, ListConsolesRequest, ListConsolesResponse } from './consoles.models';

@Injectable({ providedIn: 'root' })
export class ConsolesService {
  private readonly apiUrl = inject(ApiUrlService);
  private readonly http = inject(HttpClient);

  getConsole(challengeId: string, name: string): Promise<ConsoleState> {
    return firstValueFrom(this.http.get<ConsoleState>(this.apiUrl.build("consoles", { challengeId, name })));
  }

  listConsoles(request: ListConsolesRequest): Promise<ListConsolesResponse> {
    return firstValueFrom(this.http.get<ListConsolesResponse>(this.apiUrl.build("consoles/list", request)));
  }

  logUserActivity(eventType: ConsoleUserActivityType): Promise<ConsoleUserActivityResponse> {
    return firstValueFrom(this.http.post<ConsoleUserActivityResponse>(this.apiUrl.build("consoles/active"), null));
  }

  setConsoleActiveUser(consoleId: ConsoleId) {
    return firstValueFrom(this.http.post<void>(this.apiUrl.build("consoles/user"), consoleId));
  }
}
