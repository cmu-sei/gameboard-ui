import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';
import { UserRolePermissionKey, UserRolePermissionsOverviewResponse } from './user-role-permissions.models';
import { ApiUrlService } from '@/services/api-url.service';
import { UserRoleKey } from './user-models';

@Injectable({ providedIn: 'root' })
export class UserRolePermissionsService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  public can(user: { rolePermissions: UserRolePermissionKey[] } | null, key: UserRolePermissionKey) {
    if (!user?.rolePermissions?.length)
      return false;

    return user.rolePermissions.map(p => p.toLowerCase()).indexOf(key.toLowerCase()) >= 0;
  }

  public getRolePermissionsOverview(): Promise<UserRolePermissionsOverviewResponse> {
    return firstValueFrom(this.http.get<UserRolePermissionsOverviewResponse>(this.apiUrl.build("users/roles/permissions")));
  }

  public listRoles(): Observable<UserRoleKey[]> {
    return this.http.get<UserRolePermissionsOverviewResponse>(this.apiUrl.build("users/roles/permissions")).pipe(
      map(overview => Object.keys(overview).map(key => key as UserRoleKey))
    );
  }
}
