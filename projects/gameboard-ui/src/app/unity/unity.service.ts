import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { NewUnityChallenge, UnityActiveGame, UnityDeployContext, UnityDeployResult, UnityUndeployContext } from '../unity/unity-models';
import { LocalStorageService, StorageKey } from '../utility/local-storage.service';
import { first, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UnityService {
  private API_ROOT = `${this.config.apphost}api`;
  private LOG_PREFIX = "[UnityService]:";
  private VERBOSE = true;

  activeGame$ = new Subject<UnityActiveGame>();
  gameOver$ = new Observable();
  error$ = new Subject<any>();

  constructor (
    private config: ConfigService,
    private http: HttpClient,
    private storage: LocalStorageService) { }

  public endGame(ctx: UnityDeployContext): void {
    this.clearLocalStorageKeys();
    this.activeGame$.complete();
    this.undeployGame({ ctx }).subscribe(m => this.log("Undeploy result:", m))
  }

  public async startGame(ctx: UnityDeployContext) {
    this.log("Validating context for the game...", ctx);
    this.validateDeployContext(ctx);

    this.log("Resolving OIDC storage keys...");
    const storageKey = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;
    const oidcUserToken = this.storage.getArbitrary(storageKey);

    if (oidcUserToken == null) {
      this.reportError("You don't seem to have an OIDC token. (If this is a playtest, try relogging. Sorry 🙁)");
    }

    this.log("User OIDC resolved.");
    this.storage.add(StorageKey.UnityOidcLink, `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`);
    this.log("Added OIDC linking storage key for the Unity client.");

    this.log("Checking for an active game for the context:", ctx);
    const currentGame = await this.getCurrentGame(ctx).toPromise();
    this.log("Active game?:", currentGame)

    this.log("Checking current game for validity...", currentGame);
    if (currentGame.gamespaceId) {
      this.log("It's valid. Starting up existing game.", currentGame);
      this.startupExistingGame(currentGame);
    }
    else {
      this.log("They don't have a current game. Let's fire one up!")
      this.launchGame(ctx);
    }
  }

  public undeployGame(args: { ctx: UnityUndeployContext, retainLocalStorage?: boolean }): Observable<string> {
    if (!args.retainLocalStorage) {
      this.clearLocalStorageKeys();
    }

    const undeployEndpoint = `${this.API_ROOT}/unity/undeploy/${args.ctx.gameId}/${args.ctx.teamId}`;
    this.log("Undeploying game from", undeployEndpoint);

    return this.http.post<string>(undeployEndpoint, {});
  }

  private createLocalStorageKeys(game: UnityActiveGame) {
    this.storage.add(StorageKey.UnityGameLink, game.headlessUrl);

    if (game.vms?.length) {
      for (let i = 0; i < game.vms.length; i++) {
        this.storage.addArbitrary(`VM${i}`, game.vms[i].Url);
      }
    }
  }

  private clearLocalStorageKeys() {
    this.log("Clearing local storage keys...");
    this.storage.remove(false, StorageKey.UnityOidcLink, StorageKey.UnityGameLink);
    this.storage.removeIf((key, value) => /VM\d+/i.test(key));
    this.log("Local storage keys cleared.");
  }

  private launchGame(ctx: UnityDeployContext) {
    const deployUrl = `${this.API_ROOT}/unity/deploy/${ctx.gameId}/${ctx.teamId}`;
    this.log("Launching a new game at", deployUrl);

    this.http.post<UnityDeployResult>(deployUrl, {}).subscribe(deployResult => {
      this.log("Deployed this ->", deployResult);

      const activeGame: UnityActiveGame = {
        gamespaceId: deployResult.gamespaceId,
        headlessUrl: deployResult.headlessUrl,
        maxPoints: deployResult.totalPoints,
        vms: deployResult.vms,
        gameId: ctx.gameId,
        playerId: ctx.playerId,
        teamId: ctx.teamId,
        sessionExpirationTime: ctx.sessionExpirationTime
      };

      this.log("Starting up game for new team...")
      this.startupExistingGame(activeGame);
    });
  }

  private startupExistingGame(ctx: UnityActiveGame) {
    try {
      this.log("Starting pre-launch validation. The active game to run in the client is ->", ctx);

      // validation - did we make it?
      if (!this.isValidActiveGame(ctx)) {
        this.reportError(`Couldn't resolve the deploy result for team ${ctx.teamId}. No gamespaces available.\n\nContext: ${JSON.stringify(ctx)}`);
      }

      // we have to do this every time the unity client is booted, even if the player already has
      // challenge data at the other end. here's why:
      //
      // originally, we did this only when a player attempted to join and didn't find an active gamespace, suggesting
      // that it's their first time playing and thus a good time to create challenge data. however, if for any reason
      // they join after the space is created (say they're AFK while the rest of the group has pressed "continue to challenge"),
      // they'll get a gamespaceId when they look for a new game, so it looks like they're joining an existing game, resulting
      // in them not getting challenge data created. so we call every time here, but on the back end, we ensure that they get one
      // challenge per unity game.
      this.log(`Calling in challenge data for player ${ctx.playerId} on team ${ctx.teamId}. (They'll only ever get one challenge created for this game.)`);
      this.http.post<NewUnityChallenge>(`${this.API_ROOT}/unity/challenge`, {
        gameId: ctx.gameId,
        playerId: ctx.playerId,
        teamId: ctx.teamId,
        maxPoints: ctx.maxPoints,
        gamespaceId: ctx.gamespaceId,
        vms: ctx.vms
      }).pipe(first()).subscribe(result => {
        this.log("Deployed challenge data:", result);
      });

      // add necessary items to local storage
      this.createLocalStorageKeys(ctx);
    }
    catch (err: any) {
      this.reportError(err);
      this.endGame(ctx);
      return;
    }

    // emit the result
    this.activeGame$.next(ctx);
    this.log("Game is active. Booting Unity client!", ctx);
  }

  private getCurrentGame(ctx: UnityDeployContext): Observable<UnityActiveGame> {
    // this comes back as JSON, so we have to parse it into a real object
    return this.http.get<string>(`${this.API_ROOT}/unity/${ctx.gameId}/${ctx.teamId}`).pipe(
      first(),
      map(gameJson => JSON.parse(gameJson) as UnityActiveGame)
    );
  }

  private isValidActiveGame = (game: UnityActiveGame) => game.gamespaceId;

  private log(...messages: (string | any)[]) {
    if (this.VERBOSE) {
      console.log(this.LOG_PREFIX, ...messages);
    }
  }

  private reportError(error: string) {
    console.error("Error raised -", error);
    this.clearLocalStorageKeys();
    console.log(this.LOG_PREFIX, "Cleared Unity-related storage keys.");
    this.error$.next(error);
    throw new Error(error);
  }

  private validateDeployContext(ctx: UnityDeployContext) {
    if (!ctx) {
      this.reportError("UnityService can't start a game without a context.");
    }

    if (!ctx.sessionExpirationTime) {
      this.reportError("Can't start the game - no session expiration time was specified.");
    }

    if (!ctx.gameId) {
      this.reportError("Can't start the game - no gameId was specified.");
    }

    if (!ctx.teamId) {
      this.reportError("Can't start the game - no teamId was specified.");
    }
  }
}
