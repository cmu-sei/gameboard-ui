import { Component, OnInit } from '@angular/core';
import { UserRolePermissionKey, UserRolePermissionsOverviewResponse } from '@/api/user-role-permissions.models';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

@Component({
  selector: 'app-admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss']
})
export class AdminRolesComponent implements OnInit {
  protected appPermissionsOverview?: UserRolePermissionsOverviewResponse;
  protected rolePermissions: { [role: string]: UserRolePermissionKey[] } = {};

  public constructor(private permissionsService: UserRolePermissionsService) { }

  public async ngOnInit() {
    this.appPermissionsOverview = await this.permissionsService.getRolePermissionsOverview();

    if (!this.appPermissionsOverview)
      throw new Error("Couldn't load role permissions.");
  }
}
