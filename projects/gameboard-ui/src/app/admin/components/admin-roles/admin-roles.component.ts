import { Component, OnInit } from '@angular/core';
import { UserRole } from '@/api/user-models';
import { UserRolePermissionKey, UserRolePermissionsOverviewResponse } from '@/api/user-role-permissions.models';
import { UserService } from '@/api/user.service';

@Component({
  selector: 'app-admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss']
})
export class AdminRolesComponent implements OnInit {
  protected appPermissionsOverview?: UserRolePermissionsOverviewResponse;

  public constructor(private userService: UserService) { }

  public async ngOnInit() {
    this.appPermissionsOverview = await this.userService.listRoles();
  }
}
