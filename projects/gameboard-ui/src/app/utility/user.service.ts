// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, combineLatest, firstValueFrom, of, timer } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { ApiUser, UserOidcProfile } from '../api/user-models';
import { UserService as ApiUserService } from '../api/user.service';
import { AuthService, AuthTokenState } from './auth.service';
import { ConfigService } from './config.service';
import { LogService } from '@/services/log.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { UserRolePermissionKey } from '@/api/user-role-permissions.models';

@Injectable({ providedIn: 'root' })
export class UserService implements OnDestroy {
  private _userSub: Subscription;
  hasPermission$ = new BehaviorSubject<boolean>(false);
  user$ = new BehaviorSubject<ApiUser | null>(null);
  refresh$ = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: AuthService,
    private log: LogService,
    private permissionsService: UserRolePermissionsService,
    api: ApiUserService,
    config: ConfigService,
    router: Router
  ) {

    // when token updated, or every half hour grab a fresh mks cookie if token still good
    combineLatest([
      timer(1000, 1800000),
      this.refresh$,
      auth.tokenState$
    ]).pipe(
      map(([i, r, t]) => t),
      filter(t => t === AuthTokenState.valid && !!auth.oidcUser?.profile),
      map(tokenState => auth.oidcUser?.profile as unknown as UserOidcProfile),
      switchMap(profile => api.tryCreate({ id: profile.sub })),
      catchError(err => of(null)),
      filter(result => !!result),
    ).subscribe(result => this.user$.next(result!.user));

    auth.tokenState$.pipe(
      filter(t => t === AuthTokenState.invalid),
    ).subscribe(() => this.user$.next(null));

    auth.tokenState$.pipe(
      filter(t => t === AuthTokenState.expired),
      switchMap(() => api.logout()),
      tap(() => this.log.logInfo("token expired"))
    ).subscribe(() => {
      this.user$.next(null);
      router.navigate(['/login'], { queryParams: { redirectTo: config.currentPath } });
    });

    // log the login event for the current user (we track date of last login and total login count)
    this._userSub = this.auth.tokenState$.pipe(
      distinctUntilChanged(),
      filter(t => t === AuthTokenState.valid && !!auth.oidcUser?.profile)
    ).subscribe(async u => await firstValueFrom(api.updateLoginEvents()));
  }

  can(permission: UserRolePermissionKey) {
    return this.permissionsService.can(this.user$.value, permission);
  }

  can$(permission: UserRolePermissionKey) {
    return this.user$.pipe(
      map(u => this.permissionsService.can(u, permission))
    );
  }

  ngOnDestroy(): void {
    this._userSub?.unsubscribe();
  }

  logout(): void {
    this.auth.logout();
  }

  refresh(): void {
    this.refresh$.next(true);
  }
}
