import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { GameService } from '../api/game.service';
import { PlayerService } from '../api/player.service';
import { SyncStartGameState } from '../game/game.models';
import { UserService } from '../utility/user.service';

@Injectable({ providedIn: 'root' })
export class SyncStartGuard implements CanActivate {
  constructor(
    private gameService: GameService,
    private playerService: PlayerService,
    private localUserService: UserService,
    private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const playerId = route.paramMap.get("playerId");
    const gameId = route.paramMap.get("gameId");

    // can't make a decision without a playerId or a gameId, sorry/not sorry
    if (!playerId && !gameId) {
      return false;
    }

    // if the user is admin/tester, they can ignore sync start rules
    const localUser = this.localUserService.user$.getValue();
    if (localUser && (localUser.isAdmin || localUser.isTester)) {
      return true;
    }

    // otherwise, if this is a sync start game and it's not ready or the session hasn't started
    // send them back to the sync start loading screen
    let gamePipe = this.playerService.retrieve(playerId!).pipe(switchMap(p => this.gameService.retrieve(p.gameId)));

    if (gameId) {
      gamePipe = this.gameService.retrieve(gameId);
    }

    return gamePipe.pipe(
      switchMap(game => {
        if (!game.requireSynchronizedStart) {
          return of(true);
        }

        return this.gameService.getSyncStartState(game.id);
      }),
      map(syncStartStateOrTrue => {
        if (syncStartStateOrTrue === true) {
          return true;
        }

        const typedState = syncStartStateOrTrue as SyncStartGameState;
        if (typedState.isReady) {
          return true;
        }

        return this.router.parseUrl(`/game/{gameId}`);
      })
    );
  }
}
