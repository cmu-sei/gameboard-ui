import { Pipe, PipeTransform } from '@angular/core';
import { UserRolePermissionKey } from '@/api/user-role-permissions.models';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

@Pipe({ name: 'can' })
export class CanPipe implements PipeTransform {
  constructor(private permissionsService: UserRolePermissionsService) { }

  transform(user: { rolePermissions: UserRolePermissionKey[] } | null, permission: UserRolePermissionKey): boolean {
    return this.permissionsService.can(user, permission);
  }
}
