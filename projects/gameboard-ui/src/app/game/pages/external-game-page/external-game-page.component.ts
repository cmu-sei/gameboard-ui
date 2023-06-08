import { Component, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from "@/../environments/environment";
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LayoutService } from '@/utility/layout.service';
import { ExternalGameActive } from '@/services/external-game.service';

@Component({
  selector: 'app-external-game-page',
  templateUrl: './external-game-page.component.html',
  styleUrls: ['./external-game-page.component.scss']
})
export class ExternalGamePageComponent implements OnInit, OnDestroy {
  errors: string[] = [];
  externalGameActive?: ExternalGameActive;
  game?: Game;
  iframeWindowTitle: string = 'External Game Client';
  isProduction = true;

  constructor(
    private gameService: GameService,
    private layoutService: LayoutService,
    private route: ActivatedRoute) { }

  async ngOnInit(): Promise<void> {
    this.isProduction = environment.production;
    this.game = await this.resolveGame(this.route.snapshot.paramMap);
    this.iframeWindowTitle = `${this.game.name} (External Gameboard Game)`;
    this.layoutService.stickyMenu$.next(false);
  }

  ngOnDestroy(): void {
    this.layoutService.stickyMenu$.next(true);
  }

  private resolveGame(routeParams: ParamMap): Promise<Game> {
    const gameId = routeParams.get('gameId');
    if (!gameId) {
      this.errors.push("Couldn't resolve the gameId.");
      throw new Error("Couldn't resolve the gameId.");
    }

    return firstValueFrom(this.gameService.retrieve(gameId));
  }
}
