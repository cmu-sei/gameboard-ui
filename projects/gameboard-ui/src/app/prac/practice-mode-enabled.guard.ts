import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { GameService } from '../api/game.service';
import { PlayerMode } from '../api/player-models';

@Injectable({ providedIn: 'root' })
export class PracticeModeEnabledGuard implements CanActivate, CanActivateChild {
  constructor(private gameService: GameService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._canActivate();
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._canActivate();
  }

  _canActivate(): Observable<boolean> {
    return this.gameService.list({}).pipe(
      first(),
      map(games => games.some(g => g.playerMode == PlayerMode.practice))
    );
  }
}
