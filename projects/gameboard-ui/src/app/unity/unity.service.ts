

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { GamebrainActiveGame, UnityActiveGame, UnityContext, UnityDeployContext } from '../unity/unity-models';
import { LocalStorageService, StorageKey } from '../services/local-storage.service';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { LogService } from '../services/log.service';

@Injectable({ providedIn: 'root' })
export class UnityService {
  private API_ROOT = `${this.config.apphost}api`;
  private LOG_PREFIX = "[UnityService]:";

  activeGame$ = new Subject<UnityActiveGame>();
  gameOver$ = new Observable();
  error$ = new Subject<any>();

  constructor(
    private config: ConfigService,
    private http: HttpClient,
    private log: LogService,
    private storage: LocalStorageService) {
  }

  public endGame(ctx: UnityDeployContext): void {
    this.activeGame$.complete();
    this.undeployGame({ ctx }).subscribe(m => this.log.logInfo("Undeploy result:", m));
  }

  public async startGame(ctx: UnityDeployContext) {
    this.log.logInfo("Validating context for the game...", ctx);
    this.validateDeployContext(ctx);

    this.log.logInfo("Checking for an active game for the context:", ctx);
    const gamebrainActiveGame = await this.getGamebrainActiveGame(ctx).toPromise();
    this.log.logInfo("Active game?:", gamebrainActiveGame);

    this.log.logInfo("Checking current game for validity...");
    if (gamebrainActiveGame?.gamespaceId) {
      this.log.logInfo("It's valid. Starting up existing game.", gamebrainActiveGame);
      this.startupExistingGame(ctx, gamebrainActiveGame);
    }
    else {
      this.log.logInfo("They don't have a current game. Let's fire one up!");
      this.launchGame(ctx);
    }
  }

  public undeployGame(args: { ctx: UnityContext, retainLocalStorage?: boolean }): Observable<string | void> {
    this.log.logInfo("Undeploying with context", args.ctx);

    if (!args.retainLocalStorage) {
      this.clearLocalStorageKeys(args.ctx.teamId);
    }

    return this.getGamebrainActiveGame({ ...args.ctx }).pipe(
      first(),
      tap(activeGame => this.log.logInfo("Found this as the active game:", activeGame)),
      map(game => {
        if (!(game?.gamespaceId)) {
          this.log.logInfo("No active game.", game);
          return "Nothing to undeploy";
        }

        const undeployEndpoint = `${this.API_ROOT}/unity/undeploy/${args.ctx.gameId}/${args.ctx.teamId}`;
        this.log.logInfo("Undeploying game from", undeployEndpoint);
        return this.http.post<string>(undeployEndpoint, {});
      }),
      catchError(err => of(this.log.logInfo("Undeploy error:", err))),
      switchMap(result => result || "Nothing to undeploy"),
      tap(result => this.log.logInfo("Undeploy complete.", result))
    );
  }

  private createLocalStorageKeys(game: UnityActiveGame) {
    this.log.logInfo("Resolving OIDC storage keys...");
    const storageKey = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;
    const oidcUserToken = this.storage.getArbitrary(storageKey);

    if (oidcUserToken == null) {
      this.reportError("You don't seem to have an OIDC token. (If this is a playtest, try relogging. Sorry 🙁)", game.teamId);
    }

    this.log.logInfo("User OIDC resolved.");
    const unityOidcLinkValue = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;
    this.storage.add(StorageKey.UnityOidcLink, unityOidcLinkValue);
    this.log.logInfo("Added OIDC linking storage key for the Unity client.");

    this.storage.add(StorageKey.UnityGameLink, game.headlessUrl);
    this.log.logInfo("Added the Unity game link to local storage:", game.headlessUrl);

    // in this implementation, we store keys in two places: one to support the existing unity
    // implementation, and one to support our future direction.
    // in a future update, we'll pull the non "namespaced" version of these keys (above)
    // rely only on the keys stored under `unityChallenge:<teamId>`
    const namespaceKeyName = this.computeNamespaceKey(game.teamId);
    this.storage.addArbitrary(namespaceKeyName, JSON.stringify({
      [StorageKey.UnityOidcLink.toString()]: unityOidcLinkValue,
      [StorageKey.UnityGameLink.toString()]: game.headlessUrl,
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

  private computeNamespaceKey = (teamId: string): string => `unityChallenge:${teamId}`;

  private launchGame(ctx: UnityDeployContext) {
    const deployUrl = `${this.API_ROOT}/unity/deploy/${ctx.gameId}/${ctx.teamId}`;
    this.log.logInfo("Launching a new game at", deployUrl);

    this.http.post<GamebrainActiveGame>(deployUrl, {}).subscribe(gamebrainActiveGame => {
      this.log.logInfo("Deployed this ->", gamebrainActiveGame, "Starting up game for new team...");
      this.log.logInfo("Starting up game for new team...", gamebrainActiveGame);
      this.startupExistingGame(ctx, gamebrainActiveGame);
    });
  }

  private startupExistingGame(deployContext: UnityDeployContext, gamebrainActiveGame: GamebrainActiveGame) {
    try {
      this.log.logInfo("Starting pre-launch validation for an existing game. The active game to run in the client is ->", deployContext, gamebrainActiveGame);

      // validation - did we make it?
      if (!this.isValidActiveGame(gamebrainActiveGame)) {
        this.reportError(`Couldn't resolve the deploy result for team ${deployContext.teamId}. No gamespaces available.`);
      }

      this.log.logInfo("Merging data from the deploy context and from Gamebrain.");
      const unityActiveGame = {
        gamespaceId: gamebrainActiveGame.gamespaceId,
        headlessUrl: gamebrainActiveGame.headlessUrl,
        totalPoints: gamebrainActiveGame.totalPoints,
        vms: gamebrainActiveGame.vms,
        gameId: deployContext.gameId,
        playerId: deployContext.playerId,
        teamId: deployContext.teamId,
        sessionExpirationTime: deployContext.sessionExpirationTime
      };
      this.log.logInfo("Final merged data", unityActiveGame);

      // we have to do this every time the unity client is booted, even if the player already has
      // challenge data at the other end. here's why:
      //
      // originally, we did this only when a player attempted to join and didn't find an active gamespace, suggesting
      // that it's their first time playing and thus a good time to create challenge data. however, if for any reason
      // they join after the space is created (say they're AFK while the rest of the group has pressed "continue to challenge"),
      // they'll get a gamespaceId when they look for a new game, so it looks like they're joining an existing game, resulting
      // in them not getting challenge data created. so we call every time here, but on the back end, we ensure that they get one
      // challenge per unity game.
      this.log.logInfo(`Calling in challenge data for player ${unityActiveGame.playerId} on team ${unityActiveGame.teamId}. (They'll only ever get one challenge created for this game.)`);
      this.http.post(`${this.API_ROOT}/unity/challenge`, {
        gameId: unityActiveGame.gameId,
        playerId: unityActiveGame.playerId,
        teamId: unityActiveGame.teamId,
        maxPoints: unityActiveGame.totalPoints,
        gamespaceId: unityActiveGame.gamespaceId,
        vms: unityActiveGame.vms
      }).pipe(first()).subscribe();

      // add necessary items to local storage
      this.createLocalStorageKeys(unityActiveGame);

      // emit the result
      this.activeGame$.next(unityActiveGame);
      this.log.logInfo("Game is active. Booting Unity client!", unityActiveGame);
    }
    catch (err: any) {
      this.reportError(err, deployContext.teamId);
      this.endGame(deployContext);
      return;
    }
  }

  private getGamebrainActiveGame(ctx: UnityContext): Observable<GamebrainActiveGame> {
    // this comes back as JSON, so we have to parse it into a real object
    return this.http.get<string>(`${this.API_ROOT}/unity/${ctx.gameId}/${ctx.teamId}`).pipe(
      first(),
      map(gameJson => JSON.parse(gameJson) as GamebrainActiveGame)
    );
  }

  private isValidActiveGame = (game: GamebrainActiveGame) => game.gamespaceId;

  private reportError(error: string, teamId?: string) {
    this.log.logError("Error raised -> ", error);
    this.clearLocalStorageKeys(teamId);
    this.log.logInfo(this.LOG_PREFIX, "Cleared Unity-related storage keys.");
    this.error$.next(error);
    throw new Error(error);
  }

  private validateDeployContext(ctx: UnityDeployContext) {
    if (!ctx) {
      this.reportError("UnityService can't start a game without a context.");
    }

    if (!ctx.sessionExpirationTime) {
      this.reportError("Can't start the game - no session expiration time was specified.", ctx.teamId);
    }

    if (!ctx.gameId) {
      this.reportError("Can't start the game - no gameId was specified.", ctx.teamId);
    }

    if (!ctx.teamId) {
      this.reportError("Can't start the game - no teamId was specified.");
    }
  }
}
