import { GameStartPhase } from '@/api/game-models';
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
    const playerId = route.paramMap.get("playerId") || '';
    const gameId = route.paramMap.get("gameId") || '';

    // can't make a decision without a playerId and a gameId, sorry/not sorry
    if (!playerId && !gameId) {
      this.log.logError("Can't resolve GameIsStarted guard without player id or game id");
      return false;
    }

    let resolvedGameId = gameId;
    if (!resolvedGameId) {
      const player = await firstValueFrom(this.playerService.retrieve(playerId));
      resolvedGameId = player.gameId;
    }
    this.log.logInfo("Resolved gameId for GameIsStartedGuard", gameId);

    // if the user is admin/tester, they can ignore start phase restrictions
    const localUser = this.localUserService.user$.getValue();
    if (localUser && (localUser.isAdmin || localUser.isTester)) {
      return true;
    }

    return await firstValueFrom(this.gameService.getStartPhase(resolvedGameId).pipe(map(phase => phase == GameStartPhase.Started)));
  }
}
