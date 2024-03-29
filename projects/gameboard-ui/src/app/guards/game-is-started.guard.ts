import { GamePlayState } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { PlayerService } from '@/api/player.service';
import { LogService } from '@/services/log.service';
import { UserService } from '@/utility/user.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameIsStarted implements CanActivate, CanActivateChild {
  constructor(
    private gameService: GameService,
    private localUserService: UserService,
    private log: LogService,
    private playerService: PlayerService
  ) { }
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

  private async _canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    // if the user is admin/tester, they can ignore start phase restrictions
    const localUser = this.localUserService.user$.getValue();
    if (localUser && (localUser.isAdmin || localUser.isTester)) {
      return true;
    }

    const playerId = route.paramMap.get("playerId") || '';
    const gameId = route.paramMap.get("gameId") || '';

    // can't make a decision without a playerId (because we need their team and game)
    if (!playerId) {
      this.log.logError("Can't resolve GameIsStarted guard without playerId");
      return false;
    }

    let resolvedGameId = gameId;
    const player = await firstValueFrom(this.playerService.retrieve(playerId));
    if (!resolvedGameId) {
      resolvedGameId = player.gameId;
    }
    this.log.logInfo("Resolved gameId for GameIsStartedGuard", gameId);

    return await firstValueFrom(this.gameService.getGamePlayState(resolvedGameId).pipe(map(phase => phase == GamePlayState.Started)));
  }
}
