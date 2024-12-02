import { PlayerService } from '@/api/player.service';
import { LogService } from '@/services/log.service';
import { UserService } from '@/utility/user.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserIsPlayingGuard implements CanActivate, CanActivateChild {
  constructor(
    private log: LogService,
    private playerService: PlayerService,
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

  private async _canActivate(route: ActivatedRouteSnapshot) {
    const gameId = route.paramMap.get('gameId') || '';
    const playerId = route.paramMap.get('playerId') || '';
    this.log.logInfo("Resolving UserIsPlayingGuard", gameId, playerId);

    // need either a game or a player to decide
    if (!gameId && !playerId) {
      return false;
    }

    // need to know if the current user is the specified player
    const localUserId = this.localUserService.user$.value?.id;
    if (!localUserId) {
      return false;
    }

    // if we only have a player id, we need to resolve the gameId using the playerId
    let resolvedGameId = gameId;
    if (!gameId && playerId) {
      const player = await firstValueFrom(this.playerService.retrieve(playerId));

      if (!player) {
        this.log.logError(`Couldn't resolve a gameId for player "${playerId}".`);
        return false;
      }
      this.log.logInfo("Resolved player", player);

      if (player.userId !== localUserId) {
        this.log.logError(`The current user doesn't own playerId "${playerId}".`);
      }

      resolvedGameId = player.gameId;
      this.log.logInfo("Resolved gameId as", resolvedGameId);
    }

    const result = await firstValueFrom(this.playerService.list({ gid: resolvedGameId, uid: localUserId }));
    this.log.logInfo("Result from UserIsPlayingGuard", result.length > 0);
    return result.length > 0;
  }
}
