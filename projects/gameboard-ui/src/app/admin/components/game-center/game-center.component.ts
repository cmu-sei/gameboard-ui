import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '@/api/admin.service';
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { fa } from '@/services/font-awesome.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { firstValueFrom, interval } from 'rxjs';
import { GameCenterContext, GameCenterTab } from './game-center.models';
import { AppTitleService } from '@/services/app-title.service';
import { UserService } from '@/utility/user.service';

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
  protected selectedTab: GameCenterTab = "teams";
  protected localUser$ = this.localUserService.user$;

  constructor(
    unsub: UnsubscriberService,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private appTitle: AppTitleService,
    private gameService: GameService,
    private localUserService: UserService) {
    unsub.add(this.activatedRoute.paramMap.subscribe(async paramMap => {
      const gameId = paramMap.get("gameId") || this.gameCenterCtx?.id;
      if (gameId && gameId != this.gameCenterCtx?.id)
        await this.load(gameId);
    }));

    unsub.add(this.activatedRoute.url.subscribe(urlStuff => { console.log("some stuff", urlStuff) }));

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
  }

  protected handleSelect(tab: GameCenterTab) {
    this.selectedTab = tab;
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
