import { Component, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from "@/../environments/environment";
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LayoutService } from '@/utility/layout.service';
import { RouterService } from '@/services/router.service';
import { LogService } from '@/services/log.service';
import { ExternalGameService } from '@/services/external-game.service';

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
    private externalGameService: ExternalGameService,
    private gameService: GameService,
    private layoutService: LayoutService,
    private log: LogService,
    private route: ActivatedRoute,
    private routerService: RouterService) { }

  async ngOnInit(): Promise<void> {
    this.isProduction = environment.production;
    const teamId = this.route.snapshot.paramMap.get('teamId');

    if (!teamId) {
      this.errors.push("We couldn't locate your team. Try heading back to Home and rejoining the game.")
      this.log.logError("Couldn't resolve the teamID parameter from the route.");
      return;
    }

    // load game data and local storage stuff before we launch the iframe
    this.game = await this.resolveGame(this.route.snapshot.paramMap.get('gameId'));
    await this.externalGameService.createLocalStorageKeys(teamId);

    this.iframeWindowTitle = `${this.game.name} (External Gameboard Game)`;
    this.iframeSrcUrl = `${this.game.externalGameClientUrl}?teamId=${teamId}`;
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
