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
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Injectable({ providedIn: 'root' })
export class UserService implements OnDestroy {
  private _userSub?: Subscription;
  user$ = new BehaviorSubject<ApiUser | null>(null);
  init$ = new BehaviorSubject<boolean>(false);
  refresh$ = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: AuthService,
    private log: LogService,
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
      switchMap(profile => api.tryCreate({
        id: profile.sub
      })),
      catchError(err => of(null)),
      filter(result => !!result),
      tap(result => this.init$.next(true)),
    ).subscribe(result => this.user$.next(result!.user));

    auth.tokenState$.pipe(
      filter(t => t === AuthTokenState.invalid),
      tap(() => this.init$.next(true)),
    ).subscribe(() => this.user$.next(null));

    auth.tokenState$.pipe(
      filter(t => t === AuthTokenState.expired),
      tap(() => auth.redirectUrl = config.currentPath),
      switchMap(() => api.logout()),
      tap(() => this.log.logInfo("token expired"))
    ).subscribe(() => {
      this.user$.next(null);
      router.navigate(['/login']);
    });

    // log the login event for the current user (we track date of last login and total login count)

    this._userSub = this.user$.pipe(
      // when the user's id changes
      distinctUntilChanged((prev, current) => (prev?.id || null) === (current?.id || null)),
      // and when the user is truthy
      filter(u => !!u),
      // record a login event
    ).subscribe(async u => await firstValueFrom(api.updateLoginEvents()));
  }

  ngOnDestroy(): void {
    this._userSub?.unsubscribe();
  }

  logout(): void {
    this.auth.logout();
  }

  // an app initializer to register the user and retrieve the user's profile.
  register(): Promise<void> {
    return new Promise<void>(resolve => {
      this.init$.pipe(
        filter(v => v)
      ).subscribe(() => resolve());
    });
  }

  refresh(): void {
    this.refresh$.next(true);
  }
}
