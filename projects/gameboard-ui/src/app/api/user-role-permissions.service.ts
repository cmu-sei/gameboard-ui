// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';
import { UserRolePermissionKey, UserRolePermissionsOverviewResponse } from './user-role-permissions.models';
import { ApiUrlService } from '@/services/api-url.service';
import { UserService as LocalUser } from '@/utility/user.service';
import { UserRoleKey } from './user-models';

@Injectable({ providedIn: 'root' })
export class UserRolePermissionsService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private localUser: LocalUser) { }

  public can(permission: UserRolePermissionKey) {
    if (!this.localUser.user$?.value?.rolePermissions) {
      return false;
    }

    return this.canUser(this.localUser.user$.value, permission);
  }

  can$(permission: UserRolePermissionKey) {
    return this.localUser.user$.pipe(
      map(u => this.canUser(u, permission))
    );
  }

  public canUser(user: { rolePermissions: UserRolePermissionKey[] } | null, key: UserRolePermissionKey) {
    if (!user?.rolePermissions?.length) {
      return false;
    }

    const ownedPermissions = user.rolePermissions.map(p => p.toLowerCase());
    return ownedPermissions.indexOf(key.toLowerCase()) >= 0;
  }

  public getRolePermissionsOverview(): Promise<UserRolePermissionsOverviewResponse> {
    return firstValueFrom(this.http.get<UserRolePermissionsOverviewResponse>(this.apiUrl.build("users/roles/permissions")));
  }

  public listRoles(): Observable<UserRoleKey[]> {
    return this.http.get<UserRolePermissionsOverviewResponse>(this.apiUrl.build("users/roles/permissions")).pipe(
      map(overview => Object.keys(overview.roles).map(key => key as UserRoleKey))
    );
  }
}
