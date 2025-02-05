import { GamePlayState } from '@/api/game-models';
import { PlayerService } from '@/api/player.service';
import { TeamService } from '@/api/team.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { LogService } from '@/services/log.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameIsStarted  {
  constructor(
    private log: LogService,
    private permissionsService: UserRolePermissionsService,
    private playerService: PlayerService,
    private teamService: TeamService
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
    if (await firstValueFrom(this.permissionsService.can$("Play_IgnoreExecutionWindow"))) {
      return true;
    }

    const playerId = route.paramMap.get("playerId") || '';

    // can't make a decision without a playerId (because we need their team and game)
    if (!playerId) {
      this.log.logError("Can't resolve GameIsStarted guard without playerId");
      return false;
    }

    const player = await firstValueFrom(this.playerService.retrieve(playerId));
    this.log.logInfo("Resolved teamId for GameIsStartedGuard", player.teamId || "<no team id>");

    const playState = await firstValueFrom(this.teamService.getGamePlayState(player.teamId));
    this.log.logInfo("Guard: GameIsStartedGuard", playState, playState == GamePlayState.Started);
    return playState == GamePlayState.Started;
  }
}
