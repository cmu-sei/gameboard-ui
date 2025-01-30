import { inject, Pipe, PipeTransform } from '@angular/core';
import { UserRolePermissionKey } from '@/api/user-role-permissions.models';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { UserService } from '@/utility/user.service';

@Pipe({ name: 'can' })
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
