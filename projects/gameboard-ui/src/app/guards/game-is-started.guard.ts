import { GameStartPhase } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { UserService } from '@/utility/user.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameIsStarted implements CanActivate, CanActivateChild {
  constructor(
    private gameService: GameService,
    private localUserService: UserService
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

  private _canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const playerId = route.paramMap.get("playerId") || '';
    const gameId = route.paramMap.get("gameId") || '';

    // can't make a decision without a playerId and a gameId, sorry/not sorry
    if (!playerId && !gameId) {
      return false;
    }

    // if the user is admin/tester, they can ignore start phase restrictions
    const localUser = this.localUserService.user$.getValue();
    if (localUser && (localUser.isAdmin || localUser.isTester)) {
      return true;
    }

    return this.gameService.getStartPhase(gameId).pipe(map(phase => phase == GameStartPhase.Started));
  }
}
