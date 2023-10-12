import { Injectable } from '@angular/core';
import { LocalStorageService, StorageKey } from './local-storage.service';
import { ConfigService } from '@/utility/config.service';
import { LogService } from './log.service';
import { Subject } from 'rxjs';

export interface ExternalGameActive {
  gameServerUrl: string;
  teamId: string;
}

@Injectable({ providedIn: 'root' })
export class ExternalGameService {
  private _errors$ = new Subject<string>();
  private LOG_PREFIX = "[External Game Service]: ";

  errors$ = this._errors$.asObservable();

  constructor(
    private config: ConfigService,
    private storage: LocalStorageService,
    private log: LogService) { }

  public createLocalStorageKeys(game: ExternalGameActive) {
    this.log.logInfo("Resolving OIDC storage keys...");
    const storageKey = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;
    const oidcUserToken = this.storage.getArbitrary(storageKey);

    if (oidcUserToken == null) {
      this.reportError("You don't seem to have an OIDC token. (If this is a playtest, try relogging. Sorry 🙁)", game.teamId);
    }

    const oidcLink = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;
    this.log.logInfo("User OIDC resolved: ", oidcLink);

    const namespaceKeyName = this.computeNamespaceKey(game.teamId);
    this.storage.addArbitrary(namespaceKeyName, JSON.stringify({
      [`${namespaceKeyName}:oidcLink`]: oidcLink,
      [`${namespaceKeyName}:gameServerUrl`]: game.gameServerUrl,
    }));
  }

  private clearLocalStorageKeys(teamId?: string) {
    const keysToRemove: string[] = [StorageKey.UnityOidcLink, StorageKey.UnityGameLink];

    if (teamId) {
      keysToRemove.push(this.computeNamespaceKey(teamId));
    }

    this.log.logInfo("Clearing local storage keys...", keysToRemove);
    this.storage.removeArbitrary(false, ...keysToRemove);
    this.log.logInfo("Local storage keys cleared.");
  }

  private computeNamespaceKey = (teamId: string): string => `externalGame:${teamId}`;

  private reportError(error: string, teamId?: string) {
    this.log.logError("Error raised -> ", error);
    this.clearLocalStorageKeys(teamId);
    this.log.logInfo(this.LOG_PREFIX, `Cleared local storage keys for external game team "${teamId}".`);
    this._errors$.next(error);
    throw new Error(error);
  }
}
