import { GameEngineMode } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExternalSyncGameGuard implements CanActivate, CanActivateChild {
  constructor(private gameService: GameService) { }

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
    if (!gameId) {
      return false;
    }

    const game = await firstValueFrom(this.gameService.retrieve(gameId));
    return (game.requireSynchronizedStart && game.mode == GameEngineMode.External);
  }
}
