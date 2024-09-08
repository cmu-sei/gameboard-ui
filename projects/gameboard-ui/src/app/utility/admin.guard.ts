// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, NavigationStart, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UserService as LocalUserService } from './user.service';
import { UserService } from '@/api/user.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanActivateChild, CanLoad {
  destinationUrl: string = "";

  constructor(
    private localUser: LocalUserService,
    private permissionsService: UserRolePermissionsService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter((e): e is NavigationStart => e instanceof NavigationStart)
    ).subscribe((e: NavigationStart) => {
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
    return this.localUser.user$.pipe(
      map(u => this.permissionsService.can(u, "admin_View")),
      map(v => v ? v : this.router.parseUrl('/forbidden'))
    );
  }
}
