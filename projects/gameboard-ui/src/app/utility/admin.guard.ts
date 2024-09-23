// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, NavigationStart, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UserService as LocalUserService } from './user.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanActivateChild {
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
    return this.canActivateChild(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.localUser.user$.pipe(
      map(u => this.permissionsService.can(u, "Admin_View")),
      map(can => {
        if (can)
          return true;

        if (!state.url.includes("forbidden")) {
          return this.router.createUrlTree(["forbidden"], {
            queryParams: {
              requestedUrl: state.url
            }
          });
        }

        return this.router.createUrlTree(["forbidden"]);
      })
    );
  }
}
