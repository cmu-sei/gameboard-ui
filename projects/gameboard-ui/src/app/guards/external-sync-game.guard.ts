import { GameEngineMode, GamePlayState } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { PlayerService } from '@/api/player.service';
import { LogService } from '@/services/log.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExternalSyncGameGuard implements CanActivate, CanActivateChild {
  constructor(
    private gameService: GameService,
    private logService: LogService,
    private playerService: PlayerService) { }

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
    const playerId = route.paramMap.get('playerId') || "";

    if (!gameId || !playerId) {
      this.logService.logWarning("Can't activate ExternalSyncGameGuard for gameId + playerId", gameId, playerId);
      return false;
    }

    // try to bail out early if someone's trying to hit this route for an ineligible game
    const game = await firstValueFrom(this.gameService.retrieve(gameId));
    if (!game.requireSynchronizedStart || game.mode !== GameEngineMode.External)
      return false;

    const player = await firstValueFrom(this.playerService.retrieve(playerId));
    const playState = await firstValueFrom(this.gameService.getGamePlayState(gameId, player.teamId));

    return (playState == GamePlayState.Started);
  }
}
