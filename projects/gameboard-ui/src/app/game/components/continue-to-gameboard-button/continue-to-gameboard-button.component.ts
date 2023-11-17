import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GameEngineMode, GameStartPhase } from '@/api/game-models';
import { Player } from '@/api/player-models';
import { RouterService } from '@/services/router.service';
import { firstValueFrom } from 'rxjs';
import { GameService } from '@/api/game.service';

export interface ContinueToGameboardButtonContext {
  gameId: string;
  gameMode: GameEngineMode;
  player: Player;
}

@Component({
  selector: 'app-continue-to-gameboard-button',
  templateUrl: './continue-to-gameboard-button.component.html',
})
export class ContinueToGameboardButtonComponent implements OnChanges {
  @Input() context?: ContinueToGameboardButtonContext;

  protected buttonText = "";
  protected buttonUrl: string | null = null;
  protected isEnabled = false;

  constructor(
    private gameService: GameService,
    private routerService: RouterService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    // then we need to manually check if they've already started and redirect if so
    // const gameStartPhase = await firstValueFrom(this.apiGame.getStartPhase(ctx.game.id, ctx.player.teamId));
    // this.logService.logInfo(`Game ${ctx.game.id} (player ${ctx.player.id}) is at start phase "${gameStartPhase}".`);

    // if (gameStartPhase == GameStartPhase.Started || gameStartPhase == GameStartPhase.Starting) {
    //   this.redirectToExternalGameLoadingPage(ctx);
    // }

    if (changes.context && !!this.context) {
      switch (this.context.gameMode) {
        case "vm":
          this.buttonText = "Continue to Gameboard";
          this.buttonUrl = this.routerService.getGameboardPageUrlTree(this.context.player.id).toString();
          this.isEnabled = true;
          break;
        case "external":
          this.updateFromExternalGame(this.context);
          break;
        case "unity":
          this.buttonText = "Continue to Cubespace";
          this.buttonUrl = this.routerService.getUnityBoardUrlTree({
            gameId: this.context.gameId,
            playerId: this.context.player.id,
            teamId: this.context.player.teamId,
            sessionEnd: this.context.player.sessionEnd.valueOf()
          }).toString();
          this.isEnabled = true;
      }
    } else {
      this.buttonText = "";
      this.buttonUrl = null;
    }
  }

  private async updateFromExternalGame(context: ContinueToGameboardButtonContext) {
    this.buttonText = "Continue to Cubespace";
    this.buttonUrl = this
      .routerService
      .getGameStartPageUrlTree({ gameId: context.gameId, playerId: context.player.id })
      .toString();

    // this is only enabled if the game is started or starting
    const gameStartPhase = await firstValueFrom(this.gameService.getStartPhase(context.gameId, context.player.teamId));
    this.isEnabled = gameStartPhase == GameStartPhase.Started || gameStartPhase == GameStartPhase.Starting;
  }
}