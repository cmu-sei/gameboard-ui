import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { GameService } from '../api/game.service';
import { SyncStartState } from '../game/game.models';
import { UserService } from '../utility/user.service';

@Injectable({ providedIn: 'root' })
export class SyncStartGuard implements CanActivate {
  constructor(
    private gameService: GameService,
    private localUserService: UserService,
    private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const gameId = route.paramMap.get("gameId");

    console.log("sync start guard", gameId);

    // can't make a decision without a gameId, sorry/not sorry
    if (!gameId) {
      return false;
    }

    // if the user is admin/tester, they can ignore sync start rules
    const localUser = this.localUserService.user$.getValue();
    if (localUser && (localUser.isAdmin || localUser.isTester)) {
      console.log("user is admin tester");
      return true;
    }

    console.log("user isn't admin/tester");

    // otherwise, if this is a sync start game and it's not ready or the session hasn't started
    // send them back to the sync start loading screen
    return this.gameService.retrieve(gameId).pipe(
      switchMap(game => {
        if (!game.requireSynchronizedStart) {
          return of(true);
        }

        return this.gameService.getSyncStartState(gameId)
      }),
      map(syncStartStateOrTrue => {
        if (syncStartStateOrTrue === true) {
          return true;
        }

        const typedState = syncStartStateOrTrue as SyncStartState;
        if (typedState.isReady) {
          return true;
        }

        return this.router.parseUrl(`/game/{gameId}`);
      })
    )
  }
}
