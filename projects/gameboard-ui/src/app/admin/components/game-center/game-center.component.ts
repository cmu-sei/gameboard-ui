import { GameCenterContext } from '@/api/admin.models';
import { AdminService } from '@/api/admin.service';
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-game-center',
  templateUrl: './game-center.component.html',
  styleUrls: ['./game-center.component.scss'],
  providers: [UnsubscriberService]
})
export class GameCenterComponent {
  protected game?: Game;
  protected gameCenterCtx?: GameCenterContext;

  constructor(
    route: ActivatedRoute,
    unsub: UnsubscriberService,
    private adminService: AdminService,
    private gameService: GameService) {
    unsub.add(
      route.paramMap.subscribe(paramMap => this.load(paramMap.get("gameId")))
    );
  }

  private async load(gameId: string | null) {
    if (gameId === null || gameId == this.game?.id)
      return;

    this.game = await firstValueFrom(this.gameService.retrieve(gameId));
    this.gameCenterCtx = await this.adminService.getGameCenterContext(gameId);
  }
}
