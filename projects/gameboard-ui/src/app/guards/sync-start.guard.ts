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

    return true;
  }
}
