// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from "@/../environments/environment";
import { Game, GameEngineMode } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LayoutService } from '@/utility/layout.service';
import { RouterService } from '@/services/router.service';
import { LogService } from '@/services/log.service';
import { ExternalGameService } from '@/services/external-game.service';
import { ConfigService } from '@/utility/config.service';
import { WindowService } from '@/services/window.service';
import { AppTitleService } from '@/services/app-title.service';

@Component({
    selector: 'app-external-game-page',
    templateUrl: './external-game-page.component.html',
    styleUrls: ['./external-game-page.component.scss'],
    standalone: false
})
export class ExternalGamePageComponent implements OnInit, OnDestroy {
  errors: string[] = [];
  externalClientUrl?: string;
  game?: Game;
  iframeWindowTitle: string = `External Game Client`;
  iframeSrcUrl?: string;
  isProduction = true;

  constructor(
    private config: ConfigService,
    private externalGameService: ExternalGameService,
    private gameService: GameService,
    private layoutService: LayoutService,
    private log: LogService,
    private route: ActivatedRoute,
    private routerService: RouterService,
    private title: AppTitleService,
    private windowService: WindowService) { }

  async ngOnInit(): Promise<void> {
    this.isProduction = environment.production;
    const teamId = this.route.snapshot.paramMap.get('teamId');
    const gameId = this.route.snapshot.paramMap.get('gameId');

    if (!teamId) {
      this.errors.push("We couldn't locate your team. Try heading back to Home and rejoining the game.");
      this.log.logError("Couldn't resolve the teamID parameter from the route.");
      return;
    }

    if (!gameId) {
      this.errors.push("We couldn't locate your game. Try heading back to Home and rejoining.");
      this.log.logError("Couldn't resolve the gameId parameter from the route.");
      return;
    }

    // load game data and local storage stuff before we launch the iframe
    await this.externalGameService.createLocalStorageKeys(teamId);
    this.game = await this.resolveGame(gameId);

    if (this.game.mode !== GameEngineMode.External || !this.game.externalHostId) {
      this.log.logError(`Game ${gameId} isn't in External mode.`);
      return;
    }

    const host = await this.externalGameService.getHostClientInfo(this.game.externalHostId);

    if (!host.clientUrl) {
      this.errors.push(`Unable to resolve external game client url ("${host.clientUrl}").`);
    }

    // this.externalClientUrl = host.clientUrl;
    this.iframeWindowTitle = `${this.game.name} (External ${this.config.appName} Game)`;
    this.iframeSrcUrl = `${host.clientUrl}?teamId=${teamId}`;
    this.layoutService.stickyMenu$.next(false);
    this.title.set(this.game.name);

    this.log.logInfo("Launched external game iframe at", this.iframeSrcUrl);

    // we still don't know why, but we have to reload after hitting an iframe page
    // in order to prevent weird css bugs after launching the external game client
    this.routerService.reloadOnNextNavigateEnd();
  }

  protected handleIframeLoad() {
    this.windowService.scrollToBottom();
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
