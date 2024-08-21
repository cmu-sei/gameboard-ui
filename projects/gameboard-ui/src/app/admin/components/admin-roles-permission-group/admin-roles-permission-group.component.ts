import { UserRole } from '@/api/user-models';
import { UserRolePermissionKey, UserRolePermissionsCategory } from '@/api/user-role-permissions.models';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-roles-permission-group',
  templateUrl: './admin-roles-permission-group.component.html',
  styleUrls: ['./admin-roles-permission-group.component.scss']
})
export class AdminRolesPermissionGroupComponent {
  @Input() category?: UserRolePermissionsCategory;
  @Input() role?: UserRole;
  @Input() rolePermissions: UserRolePermissionKey[] = [];
}
