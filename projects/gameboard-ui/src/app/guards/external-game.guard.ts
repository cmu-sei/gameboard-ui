// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { GameEngineMode, GamePlayState } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { PlayerService } from '@/api/player.service';
import { LogService } from '@/services/log.service';
import { Injectable } from '@angular/core';
import { UserService as LocalUserService } from '@/utility/user.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { TeamService } from '@/api/team.service';

@Injectable({ providedIn: 'root' })
export class ExternalGameGuard  {
  constructor(
    private gameService: GameService,
    private localUserService: LocalUserService,
    private logService: LogService,
    private playerService: PlayerService,
    private teamService: TeamService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._canActivate(route);
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._canActivate(childRoute);
  }

  private async _canActivate(route: ActivatedRouteSnapshot) {
    const gameId = route.paramMap.get('gameId') || '';
    const teamId = route.paramMap.get('teamId') || "";
    const userId = this.localUserService.user$.value?.id;

    if (!gameId || !teamId || !userId) {
      this.logService.logWarning("Can't activate ExternalGameGuard for gameId, teamId, userId", gameId, teamId, userId);
      return false;
    }

    // try to bail out early if someone's trying to hit this route for an ineligible game
    const game = await firstValueFrom(this.gameService.retrieve(gameId));
    if (game.mode !== GameEngineMode.External)
      return false;

    const team = await firstValueFrom(this.playerService.getTeam(teamId));
    if (!team.members.some(m => m.userId == userId)) {
      return false;
    }

    const playState = await firstValueFrom(this.teamService.getGamePlayState(teamId));
    return playState == GamePlayState.Started;
  }
}
