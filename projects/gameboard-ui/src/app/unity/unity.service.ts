import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { NewUnityChallenge, UnityActiveGame, UnityDeployContext, UnityDeployResult, UnityUndeployContext } from '../unity/unity-models';
import { LocalStorageService, StorageKey } from '../utility/local-storage.service';

@Injectable({ providedIn: 'root' })
export class UnityService {
  private API_ROOT = `${this.config.apphost}api`;

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
    this.undeployGame(ctx).subscribe(m => this.log("Undeploy result:", m))
  }

  public async startGame(ctx: UnityDeployContext) {
    this.log("Validating context for the game...", ctx);

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

    // this.log("Cleaning up any existing keys from prior runs...");
    // this.clearLocalStorageKeys();

    const storageKey = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;
    this.log("Retrieving storage key:", storageKey);
    const oidcUserToken = this.storage.getArbitrary(storageKey);

    if (oidcUserToken == null) {
      this.reportError("You don't seem to have an OIDC token. (If this is a playtest, try relogging. Sorry.");
    }

    this.storage.add(StorageKey.UnityOidcLink, `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`);
    this.log("User OIDC resolved.");

    this.log("Checking for an active game for the context:", ctx);
    const currentGameJson = await this.getCurrentGame(ctx).toPromise();
    this.log("Active game?:", currentGameJson);

    let currentGame: UnityActiveGame;
    if (typeof currentGameJson === "string") {
      currentGame = JSON.parse(currentGameJson) as UnityActiveGame;
    }
    else {
      currentGame = currentGameJson as UnityActiveGame;
    }

    this.log("Checking current game for validity...", currentGame);
    if (currentGame.gamespaceId) {
      this.log("GamespaceId is", currentGame.gamespaceId, "- valid game");
      this.log("A game already exists for context", ctx);

      this.log("Starting up existing game.", currentGame);
      this.startupExistingGame(currentGame);
    }
    else {
      this.log("They don't have a current game. Let's fire one up!")
      this.launchGame(ctx);
    }
  }

  public undeployGame(ctx: UnityUndeployContext): Observable<string> {
    const undeployEndpoint = `${this.API_ROOT}/unity/undeploy/${ctx.gameId}/${ctx.teamId}`;
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
    this.storage.remove(false, StorageKey.UnityOidcLink, StorageKey.UnityGameLink);
    this.storage.removeIf((key, value) => /VM\d+/i.test(key));
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

      this.startupExistingGame(activeGame);
    });
  }

  private startupExistingGame(ctx: UnityActiveGame) {
    try {
      this.log("Starting pre-launch validation. The active game to run in the client is ->", ctx);

      // validation - did we make it?
      if (!this.isValidGame(ctx)) {
        this.reportError(`Couldn't resolve the deploy result for team ${ctx.teamId}. No gamespaces available.\n\nContext: ${JSON.stringify(ctx)}`);
      }

      // add necessary items to local storage
      this.createLocalStorageKeys(ctx);
    }
    catch (err: any) {
      this.reportError(err);
      this.endGame(ctx);
      return;
    }

    //
    this.log(`Creating challenge data for team ${ctx.teamId}...`);

    this.http.post<NewUnityChallenge>(`${this.API_ROOT}/unity/challenges`, {
      gameId: ctx.gameId,
      playerId: ctx.playerId,
      teamId: ctx.teamId,
      maxPoints: ctx.maxPoints,
      gamespaceId: ctx.gamespaceId,
      vms: ctx.vms
    });

    // emit the result
    this.activeGame$.next(ctx);
    this.log("Game is active. Booting Unity client!", ctx);
  }

  private getCurrentGame<UnityActiveGame>(ctx: UnityDeployContext): Observable<UnityActiveGame> {
    return this.http.get<UnityActiveGame>(`${this.API_ROOT}/unity/${ctx.gameId}/${ctx.teamId}`);
  }

  // TODO: this should check every field, but i don't know why stuff isn't working
  private isValidGame = (game: UnityActiveGame) => game.gamespaceId;

  private log(...messages: (string | any)[]) {
    console.log("[UnityService]:", ...messages);
  }

  private reportError(error: string) {
    this.clearLocalStorageKeys();
    this.error$.next(error);
    throw new Error(error);
  }
}
