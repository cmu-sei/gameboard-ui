// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ConfigService } from '@/utility/config.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { Observable, map } from 'rxjs';
import { ApiUser } from '@/api/user-models';

@Component({
    selector: 'app-user-page',
    templateUrl: './user-page.component.html',
    styleUrls: ['./user-page.component.scss'],
    standalone: false
})
export class UserPageComponent {
  protected appName: string;
  protected localUser$?: Observable<ApiUser | null>;

  constructor(
    config: ConfigService,
    localUser: LocalUserService) {
    this.appName = config.environment.settings.appname || "Gameboard";
    this.localUser$ = localUser.user$;
  }
}
