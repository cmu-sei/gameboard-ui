// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { UserService } from '@/utility/user.service';
import { Observable } from 'rxjs';
import { ApiUser } from '@/api/user-models';
import { IfHasPermissionDirective } from '@/standalone/directives/if-has-permission.directive';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
  protected fa = fa;
  protected user$?: Observable<ApiUser | null>;

  constructor(localUser: UserService) {
    this.user$ = localUser.user$;
  }
}
