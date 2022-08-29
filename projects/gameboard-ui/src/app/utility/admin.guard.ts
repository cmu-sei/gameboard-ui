// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, NavigationStart, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild, CanLoad {

  destinationUrl: string = "";

  constructor(
    private userSvc: UserService,
    private router: Router
  ){
    this.router.events.pipe(
      filter((e): e is NavigationStart => e instanceof NavigationStart)
    ).subscribe((e: NavigationStart) => {
      console.log(e.url);
      this.destinationUrl = e.url;
    });
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.validateRole();
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.validateRole();
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.validateRole();
  }

  private validateRole(): Observable<boolean | UrlTree> {
    return this.userSvc.user$.pipe(
      map(u => u?.isRegistrar || u?.isDirector || u?.isAdmin || u?.isObserver || (u?.isSupport && this.isLinkAllowedForSupportRole()) || false),
      map(v => v ? v : this.router.parseUrl('/forbidden'))
    );
  }

  private isLinkAllowedForSupportRole(): boolean {
    return !(this.destinationUrl.startsWith("/admin/registrar") || this.destinationUrl.startsWith("admin/designer"));
  }
}
