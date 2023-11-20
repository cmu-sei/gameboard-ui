import { Injectable } from '@angular/core';
import { LocalStorageService, StorageKey } from './local-storage.service';
import { ConfigService } from '@/utility/config.service';
import { LogService } from './log.service';
import { Observable, Subject, firstValueFrom, map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { HttpClient } from '@angular/common/http';
import { GetExternalTeamDataResponse } from '@/api/game-models';
import { ExternalGameAdminContext } from '@/admin/components/external-game-admin/external-game-admin.component';
import { DateTime } from 'luxon';
import { ApiDateService } from './api-date.service';

export interface ExternalGameActive {
  gameServerUrl: string;
  teamId: string;
}

@Injectable({ providedIn: 'root' })
export class ExternalGameService {
  private _errors$ = new Subject<string>();

  errors$ = this._errors$.asObservable();

  constructor(
    private apiDateService: ApiDateService,
    private apiUrl: ApiUrlService,
    private config: ConfigService,
    private httpClient: HttpClient,
    private storage: LocalStorageService,
    private log: LogService) { }

  public async createLocalStorageKeys(teamId: string): Promise<void> {
    // first check if we've already got info for this team
    this.log.logInfo("Checking for existing deploy data in local storage...");
    const teamNamespaceKeyName = this.computeNamespaceKey(teamId);
    const existingValue = JSON.parse(this.storage.getArbitrary(teamNamespaceKeyName) || "{}");

    if (existingValue[StorageKey.ExternalGameOidc] && existingValue[StorageKey.ExternalGameUrl]) {
      this.log.logInfo("Found deploy data.", existingValue);
      return existingValue;
    }

    // if not, we need to load it from the API
    this.log.logInfo("No deploy data found in local storage. Loading it from the API...");
    const externalTeamData = await firstValueFrom(this.getExternalTeamData(teamId));

    this.log.logInfo("Resolving OIDC storage keys...");
    const oidcLink = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;

    this.log.logInfo("Committing external url and OIDC key to local storage", externalTeamData.externalUrl, oidcLink);
    this.storage.addArbitrary(teamNamespaceKeyName, JSON.stringify({
      [StorageKey.ExternalGameOidc]: oidcLink,
      [StorageKey.ExternalGameUrl]: externalTeamData.externalUrl,
    }));
  }

  public clearLocalStorageKeys(teamId: string) {
    const keysToRemove: string[] = [StorageKey.UnityOidcLink, StorageKey.UnityGameLink];

    if (teamId) {
      keysToRemove.push(this.computeNamespaceKey(teamId));
    }

    this.log.logInfo("Clearing local storage keys...", keysToRemove);
    this.storage.removeArbitrary(false, ...keysToRemove);
    this.log.logInfo("Local storage keys cleared.");
  }

  public getAdminContext(gameId: string): Observable<ExternalGameAdminContext> {
    return this.httpClient.get<ExternalGameAdminContext>(this.apiUrl.build(`/admin/games/external/${gameId}`)).pipe(
      map(ctx => {
        ctx.startTime = this.apiDateService.toDateTime(ctx.startTime?.toString()) || undefined;
        ctx.endTime = this.apiDateService.toDateTime(ctx.endTime?.toString()) || undefined;

        return ctx;
      })
    );
  }

  public getExternalTeamData(teamId: string): Observable<GetExternalTeamDataResponse> {
    return this.httpClient.get<GetExternalTeamDataResponse>(this.apiUrl.build(`/games/external/team/${teamId}`));
  }

  public preDeployAll(gameId: string) {
    return this.httpClient.post<void>(this.apiUrl.build(`admin/games/external/${gameId}/pre-deploy`), {});
  }

  public preDeployTeams(gameId: string, ...teamIds: string[]) {
    return this.httpClient.post<void>(this.apiUrl.build(`admin/games/external/${gameId}/pre-deploy`), { teamIds: teamIds });
  }

  private computeNamespaceKey = (teamId: string): string => `externalGame:${teamId}`;
}
