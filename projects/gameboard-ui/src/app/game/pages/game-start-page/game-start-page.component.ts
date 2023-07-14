import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@/api/game.service';
import { LogService } from '@/services/log.service';
import { PlayerService } from '@/api/player.service';
import { UserService } from '@/utility/user.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { Game, GameMode } from '../../../api/game-models';
import { Player } from '../../../api/player-models';
import { RouterService } from '@/services/router.service';
import { GameHubService } from '@/services/signalR/game-hub.service';
import { GameStartState } from '@/services/signalR/game-hub.models';
import { AppTitleService } from '@/services/app-title.service';
import { ExternalGameService } from '@/services/external-game.service';

interface GameLaunchContext {
  game: Game;
  localUserId: string;
  player: Player;
}

@Component({
  selector: 'app-game-start-page',
  templateUrl: './game-start-page.component.html',
  styleUrls: ['./game-start-page.component.scss']
})
export class GameStartPageComponent implements OnInit, OnDestroy {
  private gameId: string | null;
  private playerId: string | null;

  private subs: Subscription[] = [];
  private externalGameLaunchStartedSub?: Subscription;
  private externalGameLaunchProgressChangedSub?: Subscription;
  private externalGameLaunchEndedSub?: Subscription;
  private gameStartFailureSub?: Subscription;

  errors: string[] = [];
  gameLaunchCtx?: GameLaunchContext;
  launchCompleted = false;
  state?: GameStartState;

  constructor(
    route: ActivatedRoute,
    private externalGameService: ExternalGameService,
    private gameApi: GameService,
    private gameHub: GameHubService,
    private log: LogService,
    private localUser: UserService,
    private playerApi: PlayerService,
    private routerService: RouterService,
    private titleService: AppTitleService) {
    this.gameId = route.snapshot.paramMap.get("gameId") || null;
    this.playerId = route.snapshot.paramMap.get("playerId") || null;
  }

  async ngOnInit(): Promise<void> {
    const localUserId = this.localUser.user$.value?.id;
    if (!localUserId) {
      this.log.logError("Can't start game - user isn't authenticated.");
      return;
    }

    if (!this.gameId) {
      this.log.logError("Can't start game - no gameId present.");
      return;
    }

    if (!this.playerId) {
      this.log.logError("Can't start game - no playerId present.");
      return;
    }

    const game = await firstValueFrom(this.gameApi.retrieve(this.gameId));
    const player = await firstValueFrom(this.playerApi.retrieve(this.playerId));

    if (player.userId != localUserId) {
      this.log.logError("Can't start game - the playerId does not belong to the currently-authenticated user.");
    }

    this.titleService.set(`Starting "${game.name}"...`);
    await this.launchGame({ game, player, localUserId });
  }

  ngOnDestroy(): void {
    for (const sub of this.subs) {
      sub?.unsubscribe();
    }
  }

  handleGameReady(ctx: GameLaunchContext) {
    if (ctx.game.mode == GameMode.Standard) {
      this.log.logInfo("Navigating to standard game", ctx.game.id);
      this.routerService.goToGamePage(ctx.game.id);
      return;
    } else if (ctx.game.mode == GameMode.External) {
      this.log.logInfo("Navigating to external game", ctx.game.id);
      this.routerService.goToExternalGamePage(ctx.game.id, ctx.player.teamId);
      return;
    }

    throw new Error("Not implemented");
  }

  private async launchGame(ctx: GameLaunchContext): Promise<void> {
    this.gameLaunchCtx = ctx;

    // if the player already has a session for the game and it's happening right now, move them along
    if (ctx.player.session?.isDuring) {
      this.handleGameReady(ctx);
    }

    // if the game is non-sync-start and is standard-vm mode, just redirect to the game page
    if (!ctx.game.requireSynchronizedStart && ctx.game.mode == GameMode.Standard) {
      this.handleGameReady(ctx);
      return;
    }

    // if the game is either sync-start or is an external game, we have work to do here
    if (!this.gameHub.isConnectedToGame(ctx.game.id)) {
      this.log.logInfo(`Not connected to game "${ctx.game.id}" - connecting now.`);
      await this.gameHub.joinGame(ctx.game.id);
      this.log.logInfo(`Connected to game "${ctx.game.id}".`);
    }
    else {
      this.log.logInfo(`Already connected to game "${ctx.game.id}". Skipping connection.`);
    }

    if (ctx.game.mode == GameMode.External) {
      this.subs.push(this.gameHub.externalGameLaunchStarted$.subscribe(state => this.state = state));
      this.subs.push(this.gameHub.externalGameLaunchProgressChanged$.subscribe(state => this.state = state));
      this.subs.push(this.gameHub.externalGameLaunchFailure$.subscribe(state => this.errors.push(state.error)));

      const externalGameLaunchEndedSub = this.gameHub.externalGameLaunchEnded$.subscribe(state => {
        this.state = state;

        const team = state.teams.find(t => t.team.id === ctx.player.teamId);
        if (!team) {
          this.log.logError(`Couldn't find a team in state for player's team ("${ctx.player.teamId}").`);
        }

        this.externalGameService.createLocalStorageKeys({ teamId: ctx.player.teamId, gameServerUrl: team!.headlessUrl });
        this.handleGameReady(ctx);
      });

      this.subs.push(externalGameLaunchEndedSub);
    }
  }
}
