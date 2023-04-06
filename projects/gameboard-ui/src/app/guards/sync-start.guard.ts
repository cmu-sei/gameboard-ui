import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameService } from '../api/game.service';
import { UserService } from '../utility/user.service';

@Injectable({ providedIn: 'root' })
export class SyncStartGuard implements CanActivate {
  constructor(
    private gameService: GameService,
    private localUserService: UserService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const gameId = route.paramMap.get("gameId");

    if (!gameId) {
      return false;
    }

    const localUser = this.localUserService.user$.getValue();
    if (localUser && (localUser.isAdmin || localUser.isTester)) {
      return true;
    }

    return this.gameService.getSyncStartState(gameId).pipe(
      map(state => state.isReady)
    );
  }
}
