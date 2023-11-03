import { Component, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from "@/../environments/environment";
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LayoutService } from '@/utility/layout.service';
import { RouterService } from '@/services/router.service';
import { LogService } from '@/services/log.service';

@Component({
  selector: 'app-external-game-page',
  templateUrl: './external-game-page.component.html',
  styleUrls: ['./external-game-page.component.scss']
})
export class ExternalGamePageComponent implements OnInit, OnDestroy {
  errors: string[] = [];
  game?: Game;
  iframeWindowTitle: string = `External Game Client`;
  iframeSrcUrl?: string;
  isProduction = true;

  constructor(
    private gameService: GameService,
    private layoutService: LayoutService,
    private log: LogService,
    private route: ActivatedRoute,
    private routerService: RouterService) { }

  async ngOnInit(): Promise<void> {
    this.isProduction = environment.production;
    this.game = await this.resolveGame(this.route.snapshot.paramMap.get('gameId'));
    this.iframeWindowTitle = `${this.game.name} (External Gameboard Game)`;
    this.iframeSrcUrl = `${this.game.externalGameClientUrl}?teamId=${this.route.snapshot.paramMap.get('teamId')}`;
    this.layoutService.stickyMenu$.next(false);

    if (!this.game.externalGameClientUrl) {
      this.errors.push(`Unable to resolve external game client Url ("${this.game.externalGameClientUrl}")`);
    }

    this.log.logInfo("Launched external game iframe at", this.iframeSrcUrl);

    // we still don't know why, but we have to reload after hitting an iframe page
    // in order to prevent weird css bugs after launching the unity client
    this.routerService.reloadOnNextNavigateEnd();
  }

  ngOnDestroy(): void {
    this.layoutService.stickyMenu$.next(true);
  }

  private resolveGame(gameId: string | null): Promise<Game> {
    if (!gameId) {
      this.errors.push("Couldn't resolve the gameId.");
      throw new Error("Couldn't resolve the gameId.");
    }

    return firstValueFrom(this.gameService.retrieve(gameId));
  }
}
