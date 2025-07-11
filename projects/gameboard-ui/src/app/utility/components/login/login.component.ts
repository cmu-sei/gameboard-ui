// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { AuthService } from '@/utility/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent {
  protected authority: string | undefined;
  protected fa = fa;
  working = false;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute) {
    this.authority = auth.authority;
  }

  async login(): Promise<void> {
    this.working = true;
    await this.auth.login(this.route.snapshot.queryParamMap.get("redirectTo") || "/");
  }
}
