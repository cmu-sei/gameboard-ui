import { AdminService } from '@/api/admin.service';
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { fa } from '@/services/font-awesome.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component } from '@angular/core';
import { firstValueFrom, interval } from 'rxjs';
import { GameCenterContext, GameCenterTab } from './game-center.models';
import { AppTitleService } from '@/services/app-title.service';
import { RouterService } from '@/services/router.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-center',
  templateUrl: './game-center.component.html',
  styleUrls: ['./game-center.component.scss'],
  providers: [UnsubscriberService]
})
export class GameCenterComponent {
  protected fa = fa;
  protected game?: Game;
  protected gameCenterCtx?: GameCenterContext;
  protected selectedTab: GameCenterTab = "settings";

  constructor(
    unsub: UnsubscriberService,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private appTitle: AppTitleService,
    private gameService: GameService,
    private routerService: RouterService) {
    unsub.add(this.activatedRoute.paramMap.subscribe(async paramMap => {
      const gameId = paramMap.get("gameId") || this.gameCenterCtx?.id;
      if (gameId && gameId != this.gameCenterCtx?.id)
        await this.load(gameId);
    }));

    unsub.add(interval(30000).subscribe(async () => {
      if (this.game && this.game?.isLive)
        this.gameCenterCtx = await this.adminService.getGameCenterContext(this.game.id);
    }));

    // listen for updates from the game service
    // rather than actually reload, we just pick off matching properties between the ctx and the game
    // (arguably should restructure ctx to use the same model)
    unsub.add(gameService.gameUpdated$.subscribe(async game => {
      if (game.id === this.gameCenterCtx?.id) {
        this.gameCenterCtx = {
          ...this.gameCenterCtx,
          ...game,
          isPractice: game.isPracticeMode
        };
      }
    }));

    // route changes
    unsub.add(this.activatedRoute.paramMap.subscribe(params => {
      this.selectedTab = params.get("selectedTab") as GameCenterTab || "settings";
    }));
  }

  protected handleSelect(tab: GameCenterTab) {
    if (!this.gameCenterCtx)
      return;

    this.routerService.toGameCenter(this.gameCenterCtx.id, tab);
  }

  private async load(gameId: string | null) {
    if (!gameId)
      return;

    if (gameId)
      this.gameCenterCtx = await this.adminService.getGameCenterContext(gameId);

    if (gameId !== this.game?.id)
      this.game = await firstValueFrom(this.gameService.retrieve(gameId));

    this.appTitle.set(this.game.name);
  }
}
