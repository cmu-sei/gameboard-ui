import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService, StorageKey } from './local-storage.service';
import { ConfigService } from '@/utility/config.service';
import { LogService } from './log.service';
import { Observable, Subject, firstValueFrom, map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { GetExternalTeamDataResponse } from '@/api/game-models';
import { ExternalGameAdminContext } from '@/admin/components/external-game-admin/external-game-admin.component';
import { ApiDateTimeService } from './api-date-time.service';

export interface ExternalGameActive {
  gameServerUrl: string;
  teamId: string;
}

@Injectable({ providedIn: 'root' })
export class ExternalGameService {
  private _errors$ = new Subject<string>();

  errors$ = this._errors$.asObservable();

  constructor(
    private apiDateService: ApiDateTimeService,
    private apiUrl: ApiUrlService,
    private config: ConfigService,
    private httpClient: HttpClient,
    private log: LogService,
    private storage: LocalStorageService) { }

  public async createLocalStorageKeys(teamId: string): Promise<void> {
    // NOTE: We no longer try to use local storage to cache the team's metadata. The goal
    // here was to avoid repeated hits for the metadata, but in test environments, a team may
    // receive a different headless assignment on multiple runs.
    const teamNamespaceKeyName = this.computeNamespaceKey(teamId);
    this.log.logInfo(`Retrieving external game data for key ${teamNamespaceKeyName} ...`);
    const externalTeamData = await firstValueFrom(this.getExternalTeamData(teamId));
    this.log.logInfo(`Retrieved external game data:`, externalTeamData);

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
