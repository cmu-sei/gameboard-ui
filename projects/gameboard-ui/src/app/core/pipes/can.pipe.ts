// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { inject, Pipe, PipeTransform } from '@angular/core';
import { UserRolePermissionKey } from '@/api/user-role-permissions.models';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { UserService } from '@/utility/user.service';

@Pipe({
    name: 'can',
    standalone: false
})
export class CanPipe implements PipeTransform {
  private localUser = inject(UserService);
  private permissionsService = inject(UserRolePermissionsService);

  transform(permission: UserRolePermissionKey): boolean {
    if (!this.localUser.user$.value) {
      return false;
    }

    return this.permissionsService.canUser(this.localUser.user$.value, permission);
  }
}
