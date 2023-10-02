// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { UserManager, UserManagerSettings, User, WebStorageStateStore, Log } from 'oidc-client-ts';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { ConfigService, Settings } from './config.service';
import { LogService } from '../services/log.service';
import { UserService } from '@/api/user.service';

export enum AuthTokenState {
  unknown = 'unknown' as any,
  valid = 'valid' as any,
  invalid = 'invalid' as any,
  expiring = 'expiring' as any,
  expired = 'expired' as any
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  mgr!: UserManager;
  authority = '';
  redirectUrl = '';
  lastCall = 0;
  renewIfActiveSeconds = 0;
  oidcUser: (User | null) = null;

  private _tokenState$ = new BehaviorSubject<AuthTokenState>(AuthTokenState.unknown);
  tokenState$: Observable<AuthTokenState> = this._tokenState$.pipe(distinctUntilChanged());

  constructor(
    private config: ConfigService,
    private log: LogService,
    private userService: UserService
  ) {
    config.settings$.pipe(filter(s => !!s.oidc.authority)).subscribe((s: Settings) => {
      if (s.oidc.debug) {
        Log.setLevel(Log.DEBUG);
        Log.setLogger(console);
      }

      this.authority = s
        .oidc?.authority?.replace(/https?:\/\//, '').split('/').reverse().pop() || 'Identity Provider';

      if (s.oidc.useLocalStorage) {
        (s.oidc.userStore as any) = new WebStorageStateStore({});
      }

      this.mgr = new UserManager(s.oidc || {} as UserManagerSettings);
      this.mgr.events.addUserSignedIn(() => this.onUserSignedIn());
      this.mgr.events.addUserLoaded(user => this.onTokenLoaded(user));
      this.mgr.events.addUserUnloaded(() => this.onTokenUnloaded());
      this.mgr.events.addAccessTokenExpiring(e => this.onTokenExpiring());
      this.mgr.events.addAccessTokenExpired(e => this.onTokenExpired());
      this.mgr.events.addUserSessionChanged(() => this.onSessionChanged());
      this.mgr.events.addSilentRenewError(e => this.onRenewError(e));
      this.mgr.getUser().then(user => this.onTokenLoaded(user));
    });
  }

  isAuthenticated(): Promise<boolean> {
    const state = this._tokenState$.getValue();
    return Promise.resolve(state === AuthTokenState.valid || state === AuthTokenState.expiring);
  }

  access_token(): string | null {
    return ((this.oidcUser)
      ? this.oidcUser.access_token
      : null);
  }

  auth_header(): string {
    this.markAction();
    return ((this.oidcUser)
      ? this.oidcUser.token_type + ' ' + this.oidcUser.access_token
      : 'no_token');
  }

  markAction(): void {
    this.lastCall = Date.now();
  }

  private onTokenLoaded(user: (User | null)): void {
    this.oidcUser = user;
    this._tokenState$.next(!!user ? AuthTokenState.valid : AuthTokenState.invalid);
  }

  private onTokenUnloaded(): void {
    this.oidcUser = null;
    this._tokenState$.next(AuthTokenState.invalid);
  }

  private onTokenExpiring(): void {
    if (this.mgr.settings.automaticSilentRenew) { return; }

    if (this.renewIfActiveSeconds > 0 && Date.now() - this.lastCall < (this.renewIfActiveSeconds * 1000)) {
      this.silentLogin();
    }
    this._tokenState$.next(AuthTokenState.expiring);
  }

  private onTokenExpired(): void {
    this._tokenState$.next(AuthTokenState.expired);
    this.expireToken();
  }

  private onSessionChanged(): void {
    this.log.logInfo("session changed");
  }

  private onRenewError(err: Error): void {
    this.expireToken();
  }

  private onUserSignedIn(): void {
    this.log.logInfo("User signed in", this.oidcUser);
  }

  externalLogin(url: string): void {
    const currentUrl = this.config.currentPath
      .replace(/login$/, '')
      .replace(/forbidden$/, '');

    this.expireToken();

    this.mgr.signinRedirect({ state: this.redirectUrl || currentUrl })
      .then(() => { this.log.logInfo("User authenticated", this.oidcUser); })
      .catch(err => this.log.logError(err));
  }

  async externalLoginCallback(url?: string): Promise<User> {
    const user = await this.mgr.signinRedirectCallback(url);

    if (this.access_token()) {
      // log the login event for the current user (we track date of last login and total login count)
      await firstValueFrom(this.userService.updateLoginEvents());
    }

    return user;
  }

  logout(): void {
    if (this.oidcUser && this._tokenState$.getValue() === AuthTokenState.valid) {
      this.mgr.signoutRedirect()
        .then(() => { })
        .catch(err => {
          this.log.logError(`Error on logout: ${err.text()}`);
        });
    }
  }

  silentLogin(): void {
    this.mgr.signinSilent()
      .catch(err => this.expireToken());
  }

  expireToken(): void {
    this.mgr.removeUser();
  }
}
