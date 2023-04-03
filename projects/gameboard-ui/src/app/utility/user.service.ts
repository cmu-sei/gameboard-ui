// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, of, timer } from 'rxjs';
import { catchError, debounceTime, filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import { NewUser, ApiUser } from '../api/user-models';
import { UserService as ApiUserService } from '../api/user.service';
import { AuthService, AuthTokenState } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user$ = new BehaviorSubject<ApiUser | null>(null);
  init$ = new BehaviorSubject<boolean>(false);
  refresh$ = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: AuthService,
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
      filter(t => t === AuthTokenState.valid),
      switchMap(t => api.register(
        auth.oidcUser?.profile as unknown as NewUser,
        auth.auth_header()
      ).pipe(
        catchError(err => of(null))
      )),
      tap(() => this.init$.next(true)),
    ).subscribe(p => this.user$.next(p));

    auth.tokenState$.pipe(
      filter(t => t === AuthTokenState.invalid),
      tap(() => this.init$.next(true)),
    ).subscribe(() => this.user$.next(null));

    auth.tokenState$.pipe(
      filter(t => t === AuthTokenState.expired),
      tap(() => auth.redirectUrl = config.currentPath),
      switchMap(() => api.logout()),
      tap(() => console.log('token expired'))
    ).subscribe(() => {
      this.user$.next(null);
      router.navigate(['/login']);
    });
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
