// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService, AuthTokenState } from './auth.service';
import { LogService } from '@/services/log.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
  private _log = inject(LogService);

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.validateAuth(state.url);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.validateAuth(state.url);
  }

  private validateAuth(url: string): Observable<boolean | UrlTree> {
    return this.auth.tokenState$.pipe(
      map(authTokenState => authTokenState === AuthTokenState.valid ? true : this.router.parseUrl(`/login?redirectTo=${url}`)),
      tap(result => this._log.logInfo("Guard: results from auth guard", result))
    );
  }
}
