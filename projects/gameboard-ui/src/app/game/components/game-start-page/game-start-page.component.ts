import { Component, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { GameService } from '../../../api/game.service';
import { LogService } from '../../../services/log.service';
import { PlayerService } from '../../../api/player.service';
import { UserService } from '../../../utility/user.service';
import { firstValueFrom } from 'rxjs';
import { Game, GameMode } from '../../../api/game-models';
import { Player } from '../../../api/player-models';
import { RouterService } from '../../../services/router.service';

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
export class GameStartPageComponent implements OnInit {
  private gameId: string | null;
  private playerId: string | null;

  constructor(
    route: ActivatedRouteSnapshot,
    private gameApi: GameService,
    private log: LogService,
    private localUser: UserService,
    private playerApi: PlayerService,
    private routerService: RouterService) {
    this.gameId = route.paramMap.get("gameId") || null;
    this.playerId = route.paramMap.get("playerId") || null;
  }

  async ngOnInit(): Promise<void> {
    if (!this.gameId) {
      this.log.logError("Can't start game - no gameId present.");
      return;
    }

    if (!this.playerId) {
      this.log.logError("Can't start game - no playerId present.");
      return;
    }

    const localUserId = this.localUser.user$.getValue()?.id;
    if (!localUserId) {
      this.log.logError("Can't start game - couldn't resolve currently-authenticated user.");
      return;
    }

    const game = await firstValueFrom(this.gameApi.retrieve(this.gameId));
    const player = await firstValueFrom(this.playerApi.retrieve(this.playerId));

    if (player.userId != localUserId) {
      this.log.logError("Can't start game - the playerId does not belong to the currently-authenticated user.");
    }

    await this.launchGame({ game, player, localUserId })
  }

  private async launchGame(ctx: GameLaunchContext): Promise<void> {
    // if the game is non-sync-start and is standard-vm mode, just redirect to the game page
    if (!ctx.game.requireSynchronizedStart && ctx.game.mode == GameMode.Standard) {
      this.routerService.goToGamePage(ctx.game.id);
      return;
    }

    // if the game is either sync-start or is an external game, we have work to do here
  }
}
