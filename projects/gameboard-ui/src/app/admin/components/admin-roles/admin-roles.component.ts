// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserRolePermissionKey, UserRolePermissionsOverviewResponse } from '@/api/user-role-permissions.models';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { CoreModule } from '@/core/core.module';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';

@Component({
    selector: 'app-admin-roles',
    imports: [
        CommonModule,
        CoreModule,
        SpinnerComponent
    ],
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
