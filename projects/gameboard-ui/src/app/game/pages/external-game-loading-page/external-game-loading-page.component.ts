import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@/api/game.service';
import { LogService } from '@/services/log.service';
import { PlayerService } from '@/api/player.service';
import { UserService } from '@/utility/user.service';
import { firstValueFrom } from 'rxjs';
import { Game, GameEngineMode, GamePlayState } from '../../../api/game-models';
import { Player } from '../../../api/player-models';
import { RouterService } from '@/services/router.service';
import { GameHubService } from '@/services/signalR/game-hub.service';
import { AppTitleService } from '@/services/app-title.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { TeamService } from '@/api/team.service';
import { GameHubEventWith, GameHubResourcesDeployStatus } from '@/services/signalR/game-hub.models';

interface GameLaunchContext {
  game: Game;
  localUserId: string;
  player: Player;
}

@Component({
  selector: 'app-game-start-page',
  templateUrl: './external-game-loading-page.component.html',
  styleUrls: ['./external-game-loading-page.component.scss'],
  providers: [UnsubscriberService]
})
export class ExternalGameLoadingPageComponent implements OnInit {
  private gameId: string | null;
  private playerId: string | null;

  protected challengesCreatedCount = 0;
  protected gamespacesDeployCount = 0;
  protected errors: string[] = [];
  protected gameLaunchCtx?: GameLaunchContext;
  protected launchCompleted = false;
  protected status?: GameHubResourcesDeployStatus;

  constructor(
    route: ActivatedRoute,
    private gameApi: GameService,
    private gameHub: GameHubService,
    private log: LogService,
    private localUser: UserService,
    private playerApi: PlayerService,
    private routerService: RouterService,
    private titleService: AppTitleService,
    private teamService: TeamService,
    private unsub: UnsubscriberService) {
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
      return;
    }

    this.titleService.set(`Starting "${game.name}"...`);
    await this.launchGame({ game, player, localUserId });
  }

  protected handleErrorDismissed(error: any) {
    if (this.gameId)
      this.routerService.goToGamePage(this.gameId);
  }

  handleGameReady(ctx: GameLaunchContext) {
    if (ctx.game.mode != GameEngineMode.External) {
      throw new Error(`Can't access games with mode "${ctx.game.mode}" from this page. `);
    }

    this.log.logInfo("Navigating to external game", ctx.game.id, ctx.player.teamId);
    this.routerService.goToExternalGamePage(ctx.game.id, ctx.player.teamId);
  }

  private async launchGame(ctx: GameLaunchContext): Promise<void> {
    this.gameLaunchCtx = ctx;
    this.log.logInfo("Launching game with context", ctx);

    // if the player already has a session for the game and it's happening right now, move them along
    const playState = await firstValueFrom(this.teamService.getGamePlayState(ctx.player.teamId));
    if (playState == GamePlayState.Started) {
      this.log.logInfo("The game is already started - move them to the game page", ctx.player);
      this.handleGameReady(ctx);
    }

    this.log.logInfo("Checking hub connection to game", ctx.game.id);
    const isConnected = this.gameHub.isConnectedToGame(ctx.game.id);

    if (!isConnected) {
      const error = `Not connected to hub for game ${ctx.game.id}`;
      this.errors.push(error);
      throw new Error(error);
    }

    this.log.logInfo("Wiring up game hub external game event listeners...", ctx);
    this.unsub.add(this.gameHub.launchStarted$.subscribe(ev => this.updateGameStartState.bind(this)(ev)));
    this.unsub.add(this.gameHub.launchProgressChanged$.subscribe(ev => this.updateGameStartState.bind(this)(ev)));
    this.unsub.add(this.gameHub.launchFailure$.subscribe(ev => this.errors.push(ev.data.message || "Unknown error")));
    this.unsub.add(
      this.gameHub.launchEnded$.subscribe(ev => {
        this.updateGameStartState(ev);
        this.handleGameReady(ctx);
      })
    );

    this.log.logInfo("External game event listeners wired.");
  }

  private updateGameStartState(ev: GameHubEventWith<GameHubResourcesDeployStatus>) {
    this.log.logInfo("Game start state update:", ev);
    this.status = ev.data;

    if (ev.data.challenges) {
      this.challengesCreatedCount = ev.data.challenges.length;
      this.gamespacesDeployCount = ev.data.challenges.filter(c => c.hasGamespace).length;
    }
  }
}
