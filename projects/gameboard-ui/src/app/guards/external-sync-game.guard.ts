import { GameEngineMode, GamePlayState } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { PlayerService } from '@/api/player.service';
import { LogService } from '@/services/log.service';
import { Injectable } from '@angular/core';
import { UserService as LocalUserService } from '@/utility/user.service';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExternalSyncGameGuard implements CanActivate, CanActivateChild {
  constructor(
    private gameService: GameService,
    private localUserService: LocalUserService,
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
    const teamId = route.paramMap.get('teamId') || "";
    const userId = this.localUserService.user$.value?.id;

    if (!gameId || !teamId || !userId) {
      this.logService.logWarning("Can't activate ExternalSyncGameGuard for gameId, teamId, userId", gameId, teamId, userId);
      return false;
    }

    // try to bail out early if someone's trying to hit this route for an ineligible game
    const game = await firstValueFrom(this.gameService.retrieve(gameId));
    if (!game.requireSynchronizedStart || game.mode !== GameEngineMode.External)
      return false;

    const team = await firstValueFrom(this.playerService.getTeam(teamId));
    if (!team.members.some(m => m.userId == userId)) {
      return false;
    }

    const playState = await firstValueFrom(this.gameService.getGamePlayState(gameId));
    return playState == GamePlayState.Started;
  }
}
